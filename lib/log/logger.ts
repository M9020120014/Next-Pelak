
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Client ------------------------------------------------------- */
export async function SubmitLogClient(
  type: string,
  location: string,
  message: string,
  details: Record<string, string>
) {
  try {
    await fetch(BASE_URL + '/api/logger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        location,
        message,
        details,
      }),
    })
  } catch (error) {
    console.log("error: " + error);
  }
}

/* --- Server ------------------------------------------------------- */
export async function SubmitLogServer(
  type: string,
  location: string,
  message: string,
  details: Record<string, string>
) {
  const detailsArray = Object.entries(details)
  try {
    console.log("┌─ --- " + type + " | " + (location || "server") + " | " + (message || "Unknown error") + " |:./ " + new Date().toISOString())
    detailsArray.map(([key, value]) => console.log(`├─ ${key}: ${value}`))
    console.log("└─ ---")
  } catch (error) {
    console.log("error: " + error);
  }
}