import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { jobId } = req.query;
  
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }
  
  try {
    console.log(`Checking status for job: ${jobId}`);
    
    // Make request to the external service to check job status
    const response = await fetch(`http://localhost:8000/api/crawl-status/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Job status for ${jobId}:`, JSON.stringify(data, null, 2));
    
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error checking job status for ${jobId}:`, error);
    return res.status(500).json({ 
      error: 'Failed to check job status',
      message: error.message
    });
  }
}
