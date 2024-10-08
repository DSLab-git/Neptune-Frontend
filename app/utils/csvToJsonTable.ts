import * as d3 from 'd3'

// Function to convert CSV string to JSON array with organization, person, and area of expertise
export function csvStringToJson(csvString: string) {
  // Parse the CSV string
  const parsedData = d3.csvParse(csvString)

  console.log('parsedData', parsedData)

  // Map the parsed data to the desired format
  const jsonArray = parsedData.map((d) => ({
    interviewee: d.interviewee,
    organization: d.organization,
    title: d.title,
    team: d.team,
  }))

  return jsonArray
}
