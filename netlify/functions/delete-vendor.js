const handler = async (event, context) => {
  const { httpMethod } = event;
  const { id } = event.pathParameters;

  if (httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Your database deletion logic here
    // This is just a placeholder - you'd need to connect to your DB
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Vendor deleted successfully',
        id: id 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal server error' 
      })
    };
  }
};

module.exports = { handler };
