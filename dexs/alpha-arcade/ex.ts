// const appFundTxns = [];
// const appDeleteTxns = [];
// const winClaimTxns = [];
// const appMatchTxns: {
//     matchTxn: algosdk.indexerModels.Transaction,
//     isInner: boolean,
//     parentTxn?: algosdk.indexerModels.Transaction
// }[] = [];
// const splitTxns = [];
// const mergeTxns = [];

// for (const txn of rawTxns.data) {
//     if (!txn.applicationTransaction || !txn.applicationTransaction.applicationArgs ||
//         txn.applicationTransaction.applicationArgs.length === 0) {
//         continue;
//     }

//     const appArg = txn.applicationTransaction.applicationArgs[0];
//     const appArgStr = Buffer.from(appArg).toString('base64');

//     if (appArgStr === CREATE_ESCOW_APP_CALL_NAME) {
//         appFundTxns.push(txn);
//     } else if (appArgStr === DELETE_APP_CALL_NAME) {
//         appDeleteTxns.push(txn);
//     } else if (appArgStr === CLAIM_APP_CALL_NAME) {
//         winClaimTxns.push(txn);
//     } else if (appArgStr === PROCESS_POTENTIAL_MATCH_APP_CALL_NAME) { // Removed sender check
//         appMatchTxns.push({ matchTxn: txn, isInner: false });
//     } else if (appArgStr === SPLIT_APP_CALL_NAME) { // Removed sender check
//         splitTxns.push(txn);
//     } else if (appArgStr === MERGE_APP_CALL_NAME) { // Removed sender check
//         mergeTxns.push(txn);
//     }

//     if (txn.innerTxns) {
//         console.log('txn had inner txns!!', txn.innerTxns);
//         for (const innerTxn of txn.innerTxns) {
//             if (!innerTxn.applicationTransaction || !innerTxn.applicationTransaction.applicationArgs ||
//                 innerTxn.applicationTransaction.applicationArgs.length === 0) {
//                 continue;
//             }

//             const innerAppArg = innerTxn.applicationTransaction.applicationArgs[0];
//             const innerAppArgStr = Buffer.from(innerAppArg).toString('base64');
//             if (innerAppArgStr === PROCESS_POTENTIAL_MATCH_APP_CALL_NAME) { // Removed sender check
//                 appMatchTxns.push({ matchTxn: innerTxn, isInner: true, parentTxn: txn });
//             }
//         }
//     }
// }




// // CLAIMS 

// if (winClaimTxns.length > 0) {
//   for (let i = 0; i < winClaimTxns.length; i += BATCH_SIZE) {
//     const batch = winClaimTxns.slice(i, i + BATCH_SIZE);
//     await Promise.all(batch.map(txn => 
//       const txnGroup = await lookupTransactionInGroup(
//         Number(txn.confirmedRound ?? 0),
//         txn.group,
//         IndexerClient
//       ); 
//        if (txnGroup.data && txnGroup.data.transactions && txnGroup.data.transactions.length > 0) { 
//           const v = Number(txnGroup.data.transactions[0]['assetTransferTransaction']?.['amount']);
//         }
//   }
// };

// // MATCHES
// if (appMatchTxns.length > 0) {
//   for (const matchInfo of appMatchTxns) {
//     const { matchTxn, isInner, parentTxn } = matchInfo;
//     try {
//       let txnGroup;
//       if (isInner && parentTxn) {
//         txnGroup = {
//           data: {
//             currentRound: Number(parentTxn.confirmedRound!),
//             transactions: parentTxn.innerTxns || []
//           }
//         };
//       } else {
//         txnGroup = await lookupTransactionInGroup(
//           Number(matchTxn.confirmedRound ?? 0),
//           matchTxn.group,
//           IndexerClient
//         );
//       }
//       if (!txnGroup.data || txnGroup.data.transactions.length < 3) { 
//       }
//       const makerAppIdFromMatchTxn = Number(txnGroup.data.transactions[0].applicationTransaction?.applicationId!);
//       const takerAppIdFromMatchTxn = Number(txnGroup.data.transactions[1].applicationTransaction?.applicationId!);
//       let vol = 0;
//       let matchTxnIndex = -1;
//       if (isInner) {
//         matchTxnIndex = txnGroup.data.transactions.findIndex(t => t === matchTxn);
//       } else {
//         matchTxnIndex = txnGroup.data.transactions.findIndex(t => 
//           t.id === matchTxn.id
//         );
//       }
//       if (matchTxnIndex >= 2) {
//         const potentialMatchMakerTxn = txnGroup.data.transactions[matchTxnIndex - 2];
//         vol = algosdk.decodeUint64(
//        Buffer.from(potentialMatchMakerTxn.applicationTransaction!.applicationArgs![2]), 
//           'safe'
//         );
//       }
//     } catch (err) {
//       console.error(`Error processing match txn:`, err);
//     }
//   }
// }


// // SPLIT

// export const processSplitTransaction  = async (txn: algosdk.indexerModels.Transaction, market: DynamoDBMarketItem, marketId: string, dynamodb: AWS.DynamoDB.DocumentClient): Promise<void> => {
//   try {
//     console.log('in processSplitTransaction');
//     const txnGroup = await lookupTransactionInGroup(
//       Number(txn.confirmedRound ?? 0),
//       txn.group,
//       IndexerClient
//     );
//     console.log('in processSplitTransaction grp :', txnGroup);
//     if (txnGroup.data && txnGroup.data.transactions && txnGroup.data.transactions.length > 0) {
//       console.log('in processSplitTransaction go ahead :');
//       const appCallIndex = txnGroup.data.transactions.findIndex(groupTxn => groupTxn.id === txn.id);
//       const amountSplit = Number(txnGroup.data.transactions[appCallIndex-1]['assetTransferTransaction']?.['amount']);
//      return amountSplit;


// };
// if (splitTxns.length > 0) {
//   for (let i = 0; i < splitTxns.length; i += BATCH_SIZE) {
//     const batch = splitTxns.slice(i, i + BATCH_SIZE);
//     await Promise.all(batch.map(txn => processSplitTransaction(txn, market, marketId, dynamodb)));
//   }
// }


// // MERGE
// xport const processMergeTransaction  = async (txn: algosdk.indexerModels.Transaction, market: DynamoDBMarketItem, marketId: string, dynamodb: AWS.DynamoDB.DocumentClient): Promise<void> => {
//   try {
//     const txnGroup = await lookupTransactionInGroup(
//       Number(txn.confirmedRound ?? 0),
//       txn.group,
//       IndexerClient
//     );
//     if (txnGroup.data && txnGroup.data.transactions && txnGroup.data.transactions.length > 0) {
//       const appCallIndex = txnGroup.data.transactions.findIndex(groupTxn => groupTxn.id === txn.id);
//       // In a merge, we're sending in both YES and NO assets, amount should be the same for both
//       const amountMerged = Number(txnGroup.data.transactions[appCallIndex-1]['assetTransferTransaction']?.['amount']);
//     return amountMerged;

// };
// if (mergeTxns.length > 0) {
//   for (let i = 0; i < mergeTxns.length; i += BATCH_SIZE) {
//     const batch = mergeTxns.slice(i, i + BATCH_SIZE);
//     await Promise.all(batch.map(txn => processMergeTransaction(txn, market, marketId, dynamodb)));
//   }
// }