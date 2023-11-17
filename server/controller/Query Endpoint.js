
function queryEndpoint(deployedIndexId, queryText, neighborCount = 3)
{

  if (!queryText) throw new Error("queryText is required");
  if (!deployedIndexId) throw new Error("deployedIndexId is required");

  console.log("Finding %s nearest neighbors for query %s", neighborCount, queryText);

  DEBUG = true
  //let queryText = "they are talking about bribery"
  const queryEmbedding =
    // Should this be an array?
    Vertex.getEmbeddings({
      task_type: "RETRIEVAL_QUERY",
      content: queryText
    })
  // getJsonFromFile('12-48V6bq_0CC2ZHEDa8zPlWXJsV0JjUG')
  const query = {
    deployed_index_id: deployedIndexId, //"call_search_1249",
    queries: [{
      datapoint: {
        datapoint_id: "0",
        feature_vector: queryEmbedding.predictions[0].embeddings.values
      },
      neighbor_count: neighborCount // TODO: make this a parameter
    }]
  }

  const result = Vertex.queryEndpoint(
    'https://1428670972.us-central1-644228337687.vdb.vertexai.goog', // TODO: update
    // 'https://1428670972.us-central1-644228337687.vdb.vertexai.goog', // TODO: update
    '492726344778514432', // endpoint id.  stays the same.
    query
  );

  console.log(JSON.stringify(result, null, 2));

  return result;

}