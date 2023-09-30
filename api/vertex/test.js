
function testVertex()
{
  DEBUG = true;
  // Vertex.checkService()
  const summary =
    Vertex.getSummary()
  console.log(summary.predictions[0]?.content)
}