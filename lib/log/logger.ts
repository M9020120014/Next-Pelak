
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Client ------------------------------------------------------- */
export async function SubmitLogClient(type: string, location: string, message: string, error: Error) {
  try {
    await fetch('/api/logger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type,
        location: location,
        message: message,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : String(error),
      }),
    })
  } catch (error) {
    console.log("error: " + error);
  }
}

/* --- Server ------------------------------------------------------- */
export async function SubmitLogServer(type: string, location: string, message: string, error: Error) {
  try {
    console.log(`
 ⎛ --- ${type} | ${location || 'server'} | ${message || 'Unknown error'} |:./ 
 ├─ Error: ${error instanceof Error ? error.message : String(error)}
 ├─ Error Name: ${error instanceof Error ? error.name : 'N/A'}
 ├─ Stack Trace: ${error instanceof Error ? error.stack : 'N/A'}
 └─ Timestamp: ${new Date().toISOString()}
    `)
  } catch (error) {
    console.log("error: " + error);
  }
}