$(document).ready(function() {

//Config
const auction_signature = keccak256('bid(uint256)');
window.contractAddressMain = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
window.contractAddressSales = "0xb1690C08E213a35Ed9bAb7B318DE14420FB57d8C"
window.etherNetwork = "https://mainnet.infura.io/o6AgXjrUIzZQGwn7ZPLl"
window.etherscanSocket = "wss://socket.etherscan.io/wshandler"



window.auctionHook = "";
window.itemsOnOrder = new Map();
window.isAccountSet = false;
window.cattributeList = [];
window.autobuyAttributes = [];
window.autobuyMode = false;

//setup
populateCattributes();


  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider(window.etherNetwork));
  }




class ListItem extends React.Component
{
  constructor(props){
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.state = {"isSelected": false};
  }

  handleOnClick()
  {
    if(this.state.isSelected == false)
    {
      this.setState({"isSelected" : true})
      window.itemsOnOrder.set(this.props.kittenID, this.props.price)
      updateBuyMenu();
    }
    else{
      this.setState({"isSelected": false});
      window.itemsOnOrder.delete(this.props.kittenID);
      updateBuyMenu();
    }
  }




render() {

    const textColor = this.state.isSelected ? "red" : "black";


    return ( React.createElement(
  "li",
  {"class":"list-group-item", "onClick" : this.handleOnClick, "style":{color:textColor}},
  React.createElement("img", { src: this.props.image_url, height:"80", width:"80"}),
  "Kitten ID: " + this.props.kittenID + " " + " | Price (ether): " + this.props.price + " | Traits: " + JSON.stringify(this.props.traits))
    );
  }

}


class ListGroup extends React.Component
{
  constructor(props){
    super(props);
  }

createListItem(kittenID, kittenPrice, traits, image_url){

return  React.createElement(
    ListItem,
    { "class": "list-group-item","kittenID" : kittenID, "price" : kittenPrice, "traits" : traits, "image_url" : image_url },
    null
  )

}

generateRows(){
  var rows = [];
  for(var i = 0; i < this.props.auctionArray.length; i++)
  { 
    rows.push(this.createListItem(this.props.auctionArray[i].id, this.props.auctionArray[i].price, this.props.auctionArray[i].traits, this.props.auctionArray[i].image_url));
  }

  return rows;
}

render() {
    return (React.createElement(
  "ul",
  { "class": "list-group" },
  this.generateRows()
  )
    );
  }

}

class TradingView extends React.Component
{
  constructor(props){
    super(props);
    this.state = {"auctionArray" : ""};
  }

//Modify the state when socket onMessage, via a global closure?, then the render will be recalled, propagating new props all the way down?
  handleSocketUpdate(){

  }

  componentWillMount(){
    window.auctionHook = (data) => {
    // `this` refers to our react component
    this.setState({"auctionArray" : data});     
    };
  }
  

render() {
    return ( React.createElement(
  ListGroup,
  {"auctionArray" : this.state.auctionArray},
  null)
    );
  }

}


//Render an empty state trading view
ReactDOM.render(
  React.createElement(TradingView, null, null),
  document.getElementById('trading_react_root')
);

    $("#setAccount").click(function(e) {

            console.log($('.ui.dropdown').dropdown("get value"));

      
      //isAccountSet = true, verify its an ETH address and display balance
         window.privateKey = new ethereumjs.Buffer.Buffer.from($("#priv_key_text").val(), 'hex')

        if(ethereumjs.Util.isValidPrivate(window.privateKey)){


          window.isAccountSet = true;

          window.address = ethereumjs.Util.bufferToHex(ethereumjs.Util.privateToAddress(window.privateKey));

          $("#priv_key_label").html("Account Address <br> (refresh page to reset) <br>" + window.address + "<br><br>" + "Balance: " + web3.fromWei(web3.eth.getBalance(window.address), 'ether') + " ETH");

          $("#priv_key_text").hide();

           $("#buy_button").prop('disabled', false);
           $("#setAccount").prop('disabled', true);
                           $("#autobuy_button").css("background","green");

                      $("#autobuy_button").prop('disabled', false);


          $("#buy_button").click(function(e) {
          
              window.itemsOnOrder.forEach(function(value, key, map)
              {
                executePurchase(key, web3.toWei(value, 'ether'));
              });
          
           });


          $("#autobuy_button").click(function(e) {

              if(window.autobuyMode == false){

                window.autobuyMode = true;
                $("#autobuy_button").css("background","red");
                           $("#buy_button").prop('disabled', true);
                           $('#price_form').prop('disabled', true);
                           alert('Please ensure you know what you are doing, buy orders will be triggered automatically until toggled off')
                           $('#buy_mode').text("Mode: AutoBuy")


              }
              else if(window.autobuyMode == true){
                window.autobuyMode = false;
                $("#autobuy_button").css("background","green");
                           $("#buy_button").prop('disabled', false);
                           $('#price_form').prop('disabled', false);
                            $('#buy_mode').text("Mode: Manual Buy")

              }
          
           });

        }
      
  });

 //Call at end
 startListening();


function updateBuyMenu()
{

   $("#buy_items_menu").html("");

  window.itemsOnOrder.forEach(function(value, key, map)
  {
      $("#buy_items_menu").append("Kittin ID:" + key + " " + " | Price: " + value + "<br>");
  });

  

}

function geneRarityCalc(kitten, cattributes)
{

  kitten.traits = cattributes;

}



function startListening()
{

socket = new WebSocket(window.etherscanSocket);


    socket.onopen = function (event) {
      socket.send(JSON.stringify({"event": "txlist", "address": window.contractAddressMain}));
      setInterval(function(){ 

          socket.send(JSON.stringify({"event": "ping"}));

        }, 20000);
      //$("#load_status").text()
    }
    socket.onclose = function(){
        // Try to reconnect in 5 seconds
        setTimeout(function(){startListening()}, 5000);
    };


    socket.onmessage = function (event) {
      //console.log(event.data);

      var response = JSON.parse(event.data);
      //console.log(event.data)
      if(response.event == "txlist")
      {
          $("#load_status").text("Listening for next batch...")

      }

      if(response.event == "txlist" && window.autobuyMode == false)
      {


           var auctionArray = [];

          for(i = 0; i<response.result.length; i++)
            {
              tx = response.result[i];

              //Cats up for auction``
              if(tx.input.slice(0, 10) == 0x3d7d3f5a)
              {

               var kitty_id = parseInt(tx.input.slice(10, 74), 16);
               var price = tx.input.slice(74, 138);
               var price_eth = web3.fromWei(parseInt(price, 16), 'ether');

               //Change from push might have gaps?
               auctionArray.push({"id": kitty_id, "price": price_eth, "rarity" : "", "image_url" : "", "traits" : []})

               $.ajax({url: "https://api.cryptokitties.co/kitties/" + kitty_id, dataType: 'json', success: function(result){

                        var api_response = JSON.parse(JSON.stringify(result));

                        updateAuctionItemExt(auctionArray, api_response.id, api_response.cattributes, api_response.image_url);

                    }});
              }
            }

            //Update react component / Clear any unactioned orders before next batch`
            window.itemsOnOrder.clear();
            updateBuyMenu();

            //window.auctionHook(auctionArray);
      }


      //
      else if(response.event == "txlist" && window.autobuyMode == true)
      {
        console.log("autobuy mode")

        var maxPrice = $('#price_form').val();

        // get values selected in dropdown
                   var auctionArray = [];
                  var promises = [];

          for(i = 0; i<response.result.length; i++)
            {
              tx = response.result[i];

              //Cats up for auction``
              if(tx.input.slice(0, 10) == 0x3d7d3f5a)
              {
               var kitty_id = parseInt(tx.input.slice(10, 74), 16);
               var price = tx.input.slice(74, 138);
               var price_eth = web3.fromWei(parseInt(price, 16), 'ether');

               auctionArray.push({"id": kitty_id, "price": price_eth, "rarity" : "", "image_url" : "", "traits" : []})

               var request = $.ajax({url: "https://api.cryptokitties.co/kitties/" + kitty_id, dataType: 'json', success: function(result){

                        var api_response = JSON.parse(JSON.stringify(result));

                        updateAuctionItemExt(auctionArray, api_response.id, api_response.cattributes, api_response.image_url);

                    }});

                  promises.push(request);

              }
            }

            $.when.apply(null, promises).done(function(){
                callAutoBuy(auctionArray);
            })


      }


  }
}

function callAutoBuy(auctionArray){

            for(x = 0; x<auctionArray.length; x++)
            {
              var catTraitsMap = new Map();
              auctionArray[x].traits.forEach(function(element) {
                 catTraitsMap.set(element.description, element.description);
              });
                traitCounter = 0;
                for(z=0; z<window.autobuyAttributes.length; z++)
                {

                  if(catTraitsMap.has(window.autobuyAttributes[z][0]))
                  {
                    traitCounter++
                  }

                  if((traitCounter == window.autobuyAttributes.length) && (auctionArray[x].price <= $('#price_form').val()))
                  {

                     console.log("Sending buy order: " + auctionArray[x].id + " at price: " + auctionArray[x].price)
                     
                     window.autobuyMode = false;
                     $("#autobuy_button").css("background","green");
                           $("#buy_button").prop('disabled', false);
                           $('#price_form').prop('disabled', false);
                            $('#buy_mode').text("Mode: Manual Buy")

                     executePurchase(auctionArray[x].id, web3.toWei(auctionArray[x].price, 'ether'));


                  }

                 
                }
              
            }

}

//Tx
function updateAuctionItemExt(auctionArray, kitty_id, cattributes, image_url)
{

  //Predata view processors


  for(i = 0; i<auctionArray.length; i++)
  {

    if(auctionArray[i].id == kitty_id)
    {
      //console.log(auctionArray)
      auctionArray[i].image_url = image_url;
      auctionArray[i].rarity = geneRarityCalc(auctionArray[i], cattributes);

    }

  }

    window.auctionHook(auctionArray);
}

//DOES NOT INCLUDE FANCIES
function populateCattributes(){

  $.ajax({url: "https://api.cryptokitties.co/cattributes?total=true", dataType: 'json', success: function(result){

    var attributes = JSON.parse(JSON.stringify(result));
    var total = 0;
    attributes.forEach(function(attribute){ total = total + parseInt(attribute.total); });
    for(i = attributes.length - 1; i>=0; i--)
    {
      var percentage = attributes[i].total/total * 100;

      switch(true) {
          case (percentage >= 20):
              qualifier = "COMMON"
              break;
          case (percentage >= 10 && percentage < 20) :
              qualifier = "UNCOMMON"
              break;
          case (percentage <= 10) :
              qualifier = "RARE"
              break;
          default:
              qualifier = "UNKNOWN"
      }
      
      window.cattributeList.push({"name":attributes[i].description + " %" + percentage.toFixed(4), "value":attributes[i].description, "percentage": percentage, "total": attributes[i].total, "qualifier": qualifier})

      //Populate drop down menu with attribute
    }

    //Populate drop down buy menu selector
    $('.ui.dropdown').dropdown({values: cattributeList});

    $('.ui.dropdown').dropdown({
       onChange: function(value, text, $selectedItem) {
    
        window.autobuyAttributes.push(value);
        
        console.log(window.autobuyAttributes)
    },

    onRemove: function(removedValue, removedText, $removedChoice) {

         for(i = 0; i<window.autobuyAttributes.length; i++)
          {

            if(window.autobuyAttributes[i] == removedValue)
            {
              window.autobuyAttributes[i] = "";
            }

          }
    }})
                        
  }});

}




function executePurchase(kitty_id, price_wei)
{
  console.log("Calling Purchase: " + kitty_id + " " + price_wei);

  kitty_hex = kitty_id.toString(16);

  console.log(kitty_hex.length)

  while(kitty_hex.length < 64)
  {
    kitty_hex = "0" + kitty_hex;
  }

  //temp hardcoded values
  var code = "0x" + '454a2ab3' + kitty_hex;

  

  var privateKey = window.privateKey;

     web3.eth.getTransactionCount(window.address, function (err, nonce) {
    var data = code;

    var tx = new ethereumjs.Tx({
      nonce: nonce,
      gasPrice: web3.toHex(web3.eth.gasPrice),
      gasLimit: 210000,
      to: window.contractAddressSales,
      value: web3.toHex(price_wei),
      data: data,
    });
    tx.sign(ethereumjs.Buffer.Buffer.from(privateKey, 'hex'));

    var raw = '0x' + tx.serialize().toString('hex');
    web3.eth.sendRawTransaction(raw, function (err, transactionHash) {
      console.log(transactionHash);
      console.log("Sent purchase order to contract for kitten ID: " + kitty_id)
            alert("Sent purchase order to contract for kitten ID: " + kitty_id)

                $("#priv_key_label").html("Account Address <br> (refresh page to reset) <br>" + window.address + "<br><br>" + "Balance: " + web3.fromWei(web3.eth.getBalance(window.address), 'ether') + " ETH");

    });
  });

}




//end doc.ready
});
