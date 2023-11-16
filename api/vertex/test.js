
function testQueryEndpoint()
{
  DEBUG = true
  const queryEmbedding = getJsonFromFile('12-48V6bq_0CC2ZHEDa8zPlWXJsV0JjUG')
  const query = {
    deployed_index_id: "call_search_test_01",
    queries: [{
      datapoint: {
        datapoint_id: "0",
        feature_vector: queryEmbedding.predictions[0].embeddings.values
      },
      neighbor_count: 3
    }]
  }
  const result = Vertex.queryEndpoint(
    'https://1428670972.us-central1-644228337687.vdb.vertexai.goog',
    '492726344778514432',
    query
  );
  console.log(JSON.stringify(result, null, 2))
}
/*

{
  "nearestNeighbors": [
    {
      "id": "0",
      "neighbors": [
        {
          "datapoint": {
            "datapointId": "151",
            "crowdingTag": {
              "crowdingAttribute": "0"
            }
          },
          "distance": 0.730333685874939
        },
        {
          "datapoint": {
            "datapointId": "324",
            "crowdingTag": {
              "crowdingAttribute": "0"
            }
          },
          "distance": 0.7248712778091431
        },
        {
          "datapoint": {
            "datapointId": "154",
            "crowdingTag": {
              "crowdingAttribute": "0"
            }
          },
          "distance": 0.7081226110458374
        }
      ]
    }
  ]
}
*/

function testListEndpoints()
{
  DEBUG = true
  const result = Vertex.listIndexEndpoints();
  console.log(JSON.stringify(result, null, 2))
}
/*
  {
  "indexEndpoints": [
    {
      "name": "projects/644228337687/locations/us-central1/indexEndpoints/492726344778514432",
      "displayName": "call-search",
      "deployedIndexes": [
        {
          "id": "call_search_test_01",
          "index": "projects/644228337687/locations/us-central1/indexes/326093158565806080",
          "createTime": "2023-11-15T13:00:55.897491Z",
          "indexSyncTime": "2023-11-15T14:26:47.800478Z",
          "automaticResources": {
            "minReplicaCount": 2,
            "maxReplicaCount": 2
          },
          "deploymentGroup": "default"
        }
      ],
      "etag": "AMEw9yPxJVucC0dy2n4h7T9aqHci8RnFSLOWXmXYS3cp8SGF4HiF-i9LTG5N0vhUa6U=",
      "createTime": "2023-11-15T01:08:36.814694Z",
      "updateTime": "2023-11-15T01:08:39.060700Z",
      "publicEndpointDomainName": "1428670972.us-central1-644228337687.vdb.vertexai.goog",
      "encryptionSpec": {}
    }
  ]
}
*/

function testCreateQueryEmbedding()
{
  const embedding = Vertex.getEmbeddings({
    task_type: "RETRIEVAL_QUERY",
    content: "Somebody is planning to lie during a trial"
  });
  saveJsonToDrive(embedding, "query.json")
}

function testGetOperation()
{
  DEBUG = true
  const result = Vertex.getOperation('5812632472948572160');
  console.log(JSON.stringify(result, null, 2))
}

function testListIndexes()
{
  DEBUG = true
  const result = Vertex.listIndexes();
  console.log(JSON.stringify(result, null, 2))
}

function testDeployIndex()
{
  DEBUG = true;
  const result = Vertex.deployIndex(
    '492726344778514432',
    'projects/644228337687/locations/us-central1/indexes/326093158565806080',
    'call_search_test_01'
  );
  console.log(JSON.stringify(result, null, 2))
}
/*
{
  "name": "projects/644228337687/locations/us-central1/indexEndpoints/492726344778514432/operations/5812632472948572160",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.DeployIndexOperationMetadata",
    "genericMetadata": {
      "createTime": "2023-11-15T13:00:55.897491Z",
      "updateTime": "2023-11-15T13:00:55.897491Z"
    },
    "deployedIndexId": "call_search_test_01"
  }
}
{
  "name": "projects/644228337687/locations/us-central1/indexEndpoints/492726344778514432/operations/5812632472948572160",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.DeployIndexOperationMetadata",
    "genericMetadata": {
      "createTime": "2023-11-15T13:00:55.897491Z",
      "updateTime": "2023-11-15T13:26:40.424870Z"
    },
    "deployedIndexId": "call_search_test_01"
  },
  "done": true,
  "response": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.DeployIndexResponse",
    "deployedIndex": {
      "id": "call_search_test_01"
    }
  }
}
*/

function testCreateIndexEndpoint()
{
  DEBUG = true;
  const result = Vertex.createIndexEndpoint('call-search');
  console.log(JSON.stringify(result, null, 2))
}

/*
{
  "name": "projects/644228337687/locations/us-central1/indexEndpoints/492726344778514432/operations/357172435272859648",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.CreateIndexEndpointOperationMetadata",
    "genericMetadata": {
      "createTime": "2023-11-15T01:08:36.814694Z",
      "updateTime": "2023-11-15T01:08:36.814694Z"
    }
  }
}
*/

function testCreateIndex()
{
  DEBUG = true;
  const result = Vertex.createIndex('demo-calls',
    'gs://call_embeddings'
  );
  console.log(JSON.stringify(result, null, 2))
}

/*

 {
  "name": "projects/644228337687/locations/us-central1/indexes/326093158565806080/operations/9142006458412433408",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.CreateIndexOperationMetadata",
    "genericMetadata": {
      "createTime": "2023-11-15T02:40:46.160299Z",
      "updateTime": "2023-11-15T02:40:46.160299Z"
    }
  }
}
  {
  "name": "projects/644228337687/locations/us-central1/indexes/326093158565806080/operations/9142006458412433408",
  "metadata": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.CreateIndexOperationMetadata",
    "genericMetadata": {
      "createTime": "2023-11-15T02:40:46.160299Z",
      "updateTime": "2023-11-15T03:34:46.030301Z"
    },
    "nearestNeighborSearchOperationMetadata": {
      "contentValidationStats": [
        {
          "sourceGcsUri": "gs://call_embeddings/embeddings.json",
          "validRecordCount": "15"
        }
      ],
      "dataBytesCount": "46271"
    }
  },
  "done": true,
  "response": {
    "@type": "type.googleapis.com/google.cloud.aiplatform.v1.Index",
    "name": "projects/644228337687/locations/us-central1/indexes/326093158565806080"
  }
}
*/

function testConvertEmbeddings()
{
  DEBUG = true;
  // const projectCalls = FirebaseDatabase.get('projectCalls/1113')
  // saveJsonToDrive(projectCalls)
  const embedJson = getJsonFromFile('1B3qh5Eay_QuVB1Ayt3pTHoOlCzKyeu_V')
  // console.log(projectCalls);
  // Per comment here, this is really a new line separated list of JSON objects, not an actual JSON file
  // https://stackoverflow.com/questions/76842924/matching-engine-index-creation-failed
  let json = embedJson.map(embedding =>
    JSON.stringify(embedding)
  ).join('\n')
  DriveApp.getRootFolder()
    .createFile(
      'embeddings.json',
      json,
      'application/json'
    )
}

function testEmbeddings()
{
  DEBUG = true;
  // const projectCalls = FirebaseDatabase.get('projectCalls/1113')
  // saveJsonToDrive(projectCalls)
  const projectCalls = getJsonFromFile('1o9G5jLXCk7bmmwxMUzTzDqyQZcxqMTU4')
  // console.log(projectCalls);
  const instances = Object.entries(projectCalls)
    .map(([id, call]) =>
    ({
      task_type: "RETRIEVAL_DOCUMENT",
      title: id,
      content: call.summary
    }))
  // console.log(instances);
  let vectors = []
  let batchStart = 0, batchSize = 5;
  while (batchStart < 15)
  { //instances.length) {
    const batch = instances.slice(batchStart, batchStart + batchSize);
    const embeddings =
      Vertex.getEmbeddings(batch)
    vectors = vectors.concat(
      embeddings.predictions.map((p, i) => ({
        id: batch[i].title,
        embedding: p.embeddings.values
      }))
    )
    batchStart += batchSize
  }
  saveJsonToDrive(vectors, "embeddings.json")
}

function testVertex()
{
  DEBUG = true;
  // Vertex.checkService()
  const summary =
    Vertex.getSummary()
  console.log(summary.predictions[0]?.content)
}