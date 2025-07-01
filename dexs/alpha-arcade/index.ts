import { writeFileSync } from "fs";
import { FetchOptions, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import fetchURL from "../../utils/fetchURL";

const fetch = async (options: FetchOptions) => {
    let dailyVolume = 0;
    const { startTimestamp, endTimestamp } = options;
    const TARGET_APP_CALL_NAMES = [
      'uh3u9Q==', // MATCH - OLD
      'gyGzvQ==', // SPLIT
      'jF2wVg==', // MERGE
      'MgBiOw=='  // CLAIM
    ];

    // Convert UNIX timestamps to RFC 3339 format
    const toRFC3339 = (timestamp: number) => new Date(timestamp * 1000).toISOString();
    const startRFC3339 = toRFC3339(startTimestamp);
    const endRFC3339 = toRFC3339(endTimestamp);
    const baseURL = `https://mainnet-idx.4160.nodely.dev/v2/transactions`;
    let nextToken: string | undefined = undefined;
    console.log(`Fetching transactions from ${startRFC3339} to ${endRFC3339}`);

    do {
      console.log(".")
      let url = `${baseURL}?min-round=1&max-round=999999999&after-time=${startRFC3339}&before-time=${endRFC3339}`;
      if (nextToken) {
        url += `&next=${nextToken}`;
      }

      const response = await fetchURL(url);
      const txns = response.transactions || [];

      const alphaArcadeTxns = txns.filter((txn) => {
        const appCall = txn['application-transaction'];
        const appArgs = appCall?.['application-args'];
        if (!Array.isArray(appArgs)) return false;

        return (
          TARGET_APP_CALL_NAMES.includes(appArgs[0])
        );
      });
      
      // console.log("alphaArcadeTxns:", JSON.stringify(alphaArcadeTxns, null, 2));
      // const timestamp = Date.now();
      // writeFileSync(`./${timestamp}.json`, JSON.stringify(alphaArcadeTxns, null, 2));

      for (const txn of alphaArcadeTxns) {
        const innerTxn = txn['inner-txns']?.[0];

        if (txn['application-transaction']?.['application-args']?.[0] === 'MgBiOw==') { // CLAIM
          try {
            const assetTransfer = innerTxn['asset-transfer-transaction'];
            if (assetTransfer && assetTransfer.amount) {

                const assetName = assetTransfer["asset-id"] === 31566704 ? "USDC" : assetTransfer["asset-id"];
                console.log("CLAIM:", assetTransfer.amount / 1e6, "with asset:", assetName, "with txnId:", txn.id);

              dailyVolume += assetTransfer.amount;
            }
          } catch (error) {
            continue;
          }
        } else if (txn['application-transaction']?.['application-args']?.[0] === 'uh3u9Q==') { // MATCH OLD
          console.log("Processing MATCH OLD transaction with id:", txn.id);
          const groupId = txn['group'];
          const round = txn['confirmed-round'];

          try {
            if (!groupId || !round) return;
            const groupUrl = `https://mainnet-idx.4160.nodely.dev/v2/transactions?round=${round}&tx-group=${groupId}`;
            const groupRes = await fetchURL(groupUrl);
            const groupTxns = groupRes.transactions || [];
          
            for (const gTxn of groupTxns) {
              console.log("Processing amtch with id :", gTxn.id);
              const gInner = gTxn['inner-txns']?.[0];
              const gAsset = gInner?.['asset-transfer-transaction'];
              if (gAsset?.amount) {
                
                const assetName = gAsset["asset-id"] === 31566704 ? "USDC" : gAsset["asset-id"];
                console.log("MATCH:", gAsset.amount / 1e6, "with asset:", assetName, "with txnId:", gTxn.id);
                dailyVolume += gAsset.amount;
              }
            }
          } catch (error) {
            console.error("Error processing MATCH transaction");
            console.error("Transaction data:", JSON.stringify(txn, null, 2));
            continue;
          }
  
        } else if (txn['application-transaction']?.['application-args']?.[0] === 'gyGzvQ==') { // SPLIT
          const assetTransfer = innerTxn['asset-transfer-transaction'];
          if (assetTransfer && assetTransfer.amount) {

            const assetName = assetTransfer["asset-id"] === 31566704 ? "USDC" : assetTransfer["asset-id"];
            console.log("SPLIT:", assetTransfer.amount / 1e6, "with asset id:", assetName, "with txnId:", txn.id);

            dailyVolume += assetTransfer.amount;
          }

        } else if (txn['application-transaction']?.['application-args']?.[0] === 'jF2wVg==') { // MERGE
          const assetTransfer = innerTxn['asset-transfer-transaction'];
            if (assetTransfer && assetTransfer.amount) {
            
              const assetName = assetTransfer["asset-id"] === 31566704 ? "USDC" : assetTransfer["asset-id"];
              console.log("MERGE:", assetTransfer.amount / 1e6, "with asset id:", assetName, "with txnId:", txn.id);
            
              dailyVolume += assetTransfer.amount;
          }
        }

          // dailyVolume += amount;
      }

      nextToken = response['next-token'];
    } while (nextToken);

    return {
      dailyVolume: dailyVolume / 1e6, // Convert from microUSDC
    };
};

const adapter: SimpleAdapter = {
    version: 2,
    adapter:{
      [CHAIN.ALGORAND]: {
          fetch: fetch,
          start: '2025-03-30',
      }
    }
};

export default adapter;