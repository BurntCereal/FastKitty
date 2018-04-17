# FastKitty

A cryptokitty bot that snoops txs as they arrive to the smart contract to allow submission of purchase orders before they arrive on marketplace. Designed during the high volume days of cryptokitties when it was released in 2017, I finally got around to uploading the code. 

Still beneficial to anyone looking for a cat with certain attributes at a certain price.

## How to use:

There are two modes of operation, manual and auto:

Manual

1) Enter your private key (make sure MetaMask is disabled, see note at bottom)
2) Wait for new cats to sells to reach network (volume dependent)
3) Select a cat you want and hit purchase (keep an eye on the price)

Auto

1) Enter your private key (make sure MetaMask is disabled, see note at bottom)
2) Select which attributes you'd like (currently does not support fancies)
3) Enter your max price
4) Toggle Autobuy and sit back

If you would like additional features or encounter any issues, please create a request in the issue tracker.

Note: This tool was created during the initial days of cryptokitties when congestion caused MetaMask to load very slowly. This solution allows you to use your private key directly in your browser (make sure MetaMask is disabled), for security reasons it is recommended you clone and use locally. The private key is only used in your client!

### Config
There is no guarantee that the keys used to talk to the ether mainnet, etherscan socket or original contract will still be operational, in that case the respective values will need to be updated if used locally.

#### Verified and listed by official subreddit
https://www.reddit.com/r/CryptoKitties/wiki/sidebarsites
