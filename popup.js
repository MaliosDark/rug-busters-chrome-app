document.getElementById('analyze').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
  
      // Verificar si la URL de la pestaña activa contiene 'dexscreener'
      if (!tab.url.includes('dexscreener')) {
        alert('It seems that you need to have a tab of DeXscreener open in order to use this extension.');
        return;
      }
  
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: analyzeToken
      });
    });
  });
  
  function analyzeToken() {
    const getTokenUrl = () => {
      let tokenUrl;
      try {
        tokenUrl = document.querySelector("header .chakra-image").src;
      } catch (error) {
        tokenUrl = document.querySelector("[title='Open DEX website in new window']").href;
      }
      return tokenUrl;
    };
  
    const extractBlockchainAndAddress = (url) => {
      const patternsToMatch = [
        /([^/]+)\.png/,
        /outputCurrency=([^&]+)(?:&|$)/
      ];
  
      for (const pattern of patternsToMatch) {
        const patternMatch = url.match(pattern);
        if (patternMatch) {
          return {
            blockchain: window.location.pathname.split("/")[1],
            address: patternMatch[1],
          };
        }
      }
      return null;
    };
  
    const tokenLogoUrl = getTokenUrl();
    const { blockchain, address } = extractBlockchainAndAddress(tokenLogoUrl);
  
    const getServiceUrlByBlockchain = {
      solana: address => `https://rugcheck.xyz/tokens/${address}`,
      base: address => `https://de.fi/scanner/contract/${address}?chainId=base`,
      ethereum: address => `https://de.fi/scanner/contract/${address}?chainId=eth`,
      bsc: address => `https://de.fi/scanner/contract/${address}?chainId=bnb`,
      avalanche: address => `https://de.fi/scanner/contract/${address}?chainId=avax`,
      arbitrum: address => `https://de.fi/scanner/contract/${address}?chainId=arbi`,
    };
  
    if (blockchain && address) {
      const serviceUrl = getServiceUrlByBlockchain[blockchain](address);
      window.open(serviceUrl, "_blank");
    } else {
      alert("It looks like there was an issue with extracting the blockchain or token address using this extension.");
    }
  }
