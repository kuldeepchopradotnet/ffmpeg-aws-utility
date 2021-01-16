var awsServices = require('../modules/base.aws')
var dynamoClient = awsServices.dynamoClient();

var dynamodb = dynamoClient.dbClient;
var docClient = dynamoClient.docClient;


function createTableWithSecondaryIndex(tableName) {
    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "Id", KeyType: "HASH" },
            { AttributeName: "PId", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
            { AttributeName: "Id", AttributeType: "S" },
            { AttributeName: "PId", AttributeType: "N" },
            { AttributeName: "Name", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        },
        GlobalSecondaryIndexes: [
            {
                IndexName: 'Name_index',
                KeySchema: [
                    {
                        AttributeName: 'Name',
                        KeyType: 'HASH',
                    }
                ],
                Projection: {
                    ProjectionType: 'ALL'
                },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5,
                },
            }
        ]
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.log("createTable", err);
        } else {
            console.log("createTable", data);
        }
    });
}


function createTable(tableName) {
    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "Name", KeyType: "HASH" },
            { AttributeName: "PartNumber", KeyType: "RANGE" },
            //{ AttributeName: "Data", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [
            { AttributeName: "PartNumber", AttributeType: "N" },
            { AttributeName: "Name", AttributeType: "S" },
            //{ AttributeName: "Data", AttributeType: "B" }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.log("createTable", err);
        } else {
            console.log("createTable", data);
        }
    });
}

// function putItem(partNumber, name, data, callback) {
//     let id = utils.uuid();
//     var params = {
//         TableName: TABLE,
//         Item: {
//             "Id": id,
//             "PartNumber": partNumber,
//             "Name": name,
//             "Data": data
//         },
//         ReturnConsumedCapacity: "TOTAL",
//     };
//     docClient.put(params, callback);
// }


function queryData(fileName, limit) {

    return new Promise((res, rej) => {
        var params = {
            TableName: TABLE,
            //IndexName: 'Name_index',
            KeyConditionExpression: "#fN = :fileName and #pn <= :partnumber",
            //FilterExpression: "#pn <= :partnumber",
            ExpressionAttributeNames: {
                "#pn": "PartNumber",
                "#fN": "Name"
            },
            ExpressionAttributeValues: {
                ":fileName": fileName,
                ":partnumber": limit
            },
            ReturnConsumedCapacity: 'TOTAL'
        };
        let records = [];
        docClient.query(params, onScan);

        function onScan(err, data) {
            if (err) {
                console.log("onScan", err);
            } else {
                //console.log("data",data)

                data.Items.forEach(i => {
                    //console.log(`partNumber:${i.PartNumber}, Name: ${i.Name}`);
                    records.push(i);
                    //console.log(Buffer.from(i.Data).toString());
                })
                //console.log(`ScannedCount:${data.ScannedCount}, Count: ${data.Count}`);
                //console.log(data.ConsumedCapacity);

                // Continue scanning if we have more items (per scan 1MB limitation)
                if (data.LastEvaluatedKey) {
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.query(params, onScan);
                }
                else {
                    res(records);
                }
            }
        }
    })
}


function scanData(table,fileName) {
    var params = {
        TableName: table,
        ProjectionExpression: "#fN, #pN, #dC",
        FilterExpression: "#fN = :fileName",
        ExpressionAttributeNames: {
            "#fN": "Name",
            "#pN": "PartNumber",
            "#dC": "Id"
        },
        ExpressionAttributeValues: {
            ":fileName": fileName
        },
        ReturnConsumedCapacity: 'TOTAL'
    };

    docClient.scan(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.log("onScan", err);
        } else {
            //console.log("data",data)
            data.Items.forEach(i => {
                console.log(`partNumber:${i.PartNumber}, Name: ${i.Name}`);
                //console.log(Buffer.from(i.Data).toString());
            })
            console.log(`ScannedCount:${data.ScannedCount}, Count: ${data.Count}`);
            console.log(data.ConsumedCapacity);

            //Continue scanning if we have more items (per scan 1MB limitation)
            if (data.LastEvaluatedKey) {
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
        }
    }
}


function createTable() {
    var params = {
        AttributeDefinitions: [
            {
                AttributeName: "Id",
                AttributeType: "S"
            }],
        KeySchema: [
            {
                AttributeName: "Id",
                KeyType: "HASH"
            }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        },
        TableName: TABLE
    };
    dynamodb.createTable(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);
    });
}


function putItem2(partNumber, name, data, callback) {
    var params = {
        Item: {
            "PartNumber": {
                N: partNumber.toString()
            },
            "Name": {
                S: name
            },
            "Data": {
                B: data
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: TABLE
    };
    dynamodb.putItem(params, callback);
}
function putItem(partNumber, name, data, callback) {
    var params = {
        Item: {
            "PartNumber": {
                N: partNumber.toString()
            },
            "Name": {
                S: name
            },
            "Data": {
                B: data
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: TABLE
    };
    dynamodb.putItem(params, callback);
}

function filter(query) {
    return new Promise((res, rej) => {
        var params = {
            ExpressionAttributeNames: {
                "#PN": "PartNumber",
                "#NAME": "Name",
                "#DT": "Data"
            },
            ExpressionAttributeValues: {
                ":a": {
                    S: query
                }
            },
            FilterExpression: "#NAME = :a",
            ProjectionExpression: "#NAME, #PN,#DT",
            TableName: TABLE
        };



        // dynamodb.scan(params, function (err, data) {
        //     if (err) {
        //         console.log(err, err.stack); // an error occurred
        //         rej(err);
        //     }
        //     else {
        //         let ndata = [];
        //         console.log(data);
        //         data.Items.sort(function (a, b) {
        //             return a.PartNumber.N - b.PartNumber.N
        //         });

        //         data.Items.forEach(i => {
        //             //let data =  Buffer.from(i.Data.B).toString();
        //             // console.log(data);
        //             console.log(i.PartNumber.N);
        //             ndata.push(i.Data.B);

        //         })
        //         let dataBuffer = Buffer.concat(ndata)
        //         res(dataBuffer);

        //     }
        // });


        dynamodb.scan(params, onScan);
        var allItems = [];
        function onScan(err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Scan succeeded.");
                data.Items.forEach(function (item) {
                    allItems.push(item);
                });
                if (typeof data.LastEvaluatedKey != "undefined") {
                    console.log("Scanning for more...");
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    dynamodb.scan(params, onScan);
                }
                else {
                    let ndata = [];
                    allItems.sort(function (a, b) {
                        return a.PartNumber.N - b.PartNumber.N
                    });

                    allItems.forEach(i => {
                        console.log(i.PartNumber.N);
                        ndata.push(i.Data.B);

                    })
                    let dataBuffer = Buffer.concat(ndata)
                    res(dataBuffer);
                    //res({count: allItems.length, items: allItems});
                }
            }
        }



    });
}

function del(name, partNumber) {
    console.log(name);
    var params = {
        Key: {
            "Id": {
                S: name
            },
            // "PartNumber": {
            //     N: partNumber
            // }
        },
        TableName: TABLE
    };
    dynamodb.deleteItem(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
}

async function delAll() {
    let result = await getAll();
    console.log(result);
    if (result && result.items) {
        for (var i = 0; i < result.items.length; i++) {
            //result.items.forEach(async(i) => {
            // console.log(i.Id.S);
            var params = {
                Key: {
                    "Id": {
                        S: result.items[i].Id.S
                    }
                },
                TableName: TABLE
            };
            await new Promise((res, rej) => {
                dynamodb.deleteItem(params, function (err, data) {
                    if (err) {
                        console.log(err, err.stack)
                        rej(err)
                    }
                    else {
                        console.log("deleted", result.items[i].Id.S);
                        res(true)
                    }
                });
            })

        }
        //)
    }
}

function getAll() {
    return new Promise((res, rej) => {
        var params = {
            ExpressionAttributeNames: {
                "#PN": "PartNumber",
                "#NAME": "Name",
                "#ID": "Id"
            },
            ProjectionExpression: "#ID,#NAME, #PN",
            TableName: TABLE
        };
        dynamodb.scan(params, onScan);
        var allItems = [];
        function onScan(err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Scan succeeded.");
                data.Items.forEach(function (item) {
                    allItems.push(item);
                });
                // if (typeof data.LastEvaluatedKey != "undefined") {
                //     console.log("Scanning for more...");
                //     params.ExclusiveStartKey = data.LastEvaluatedKey;
                //     dynamodb.scan(params, onScan);
                // }
                // else {
                console.log(allItems.length);
                res({ count: allItems.length, items: allItems });
                //}
            }
        }
    });
}


function deleteItems(fileName) {

    var params = {
        TableName: TABLE,
        //IndexName: 'Name_index',
        ProjectionExpression: "#fN, #pN",
        ExpressionAttributeNames: {
            "#fN": "Name",
            "#pN": "PartNumber"
        },
        KeyConditionExpression: "#fN = :fileName",
        // ExpressionAttributeNames: {
        //     "#fN": "Name"
        // },
        ExpressionAttributeValues: {
            ":fileName": fileName
        },
        ReturnConsumedCapacity: 'TOTAL'
    };

    docClient.query(params, onScan);

    function onScan(err, data) {
        if (err) {
            console.log("onScan", err);
        } else {
            //console.log("data",data)
            data.Items.forEach(i => {
                var params = {
                    TableName: TABLE,
                    Key: {
                        Name: i.Name,
                        PartNumber: i.PartNumber,
                    }
                };
                docClient.delete(params, function (err, data) {
                    if (err) {
                        console.log("delete", err);
                    } else {
                        console.log("delete", data);
                    }
                });
            })

            if (data.LastEvaluatedKey) {
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.query(params, onScan);
            }
        }
    }
}


function deleteTable() {
    var params = {
        TableName: TABLE
    };

    dynamodb.deleteTable(params, function (err, data) {
        if (err) {
            console.log("deleteTable", err)
        } else {
            console.log("deleteTable", data)
        }
    });
}


function deleteItem(key) {
    return new Promise((res, rej) => {
        var params = {
            TableName: TABLE,
            Key: key
        };
        docClient.delete(params, function (err, data) {
            if (err) {
                //console.log("delete", err);
            } else {
                //console.log("delete", data);
                res(true);
            }
        });
    })

}


function describeTable() {
    var params = {
        TableName: TABLE
    };
    dynamodb.describeTable(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            //console.log(data); 
            let ds = JSON.stringify(data, null, 4)
            console.log(ds);
        }
    })
}



module.exports = function () {
    return {
        createTable,
        putItem,
        filter,
        del,
        getAll,
        delAll,
        queryData,
        deleteItem,
        scanData,
        deleteTable,
        createTableGSI,
        createTable1,
        deleteItems,
        describeTable
    }
}