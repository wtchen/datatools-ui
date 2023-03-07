import { writeFileSync } from 'fs'

import fetch from 'isomorphic-fetch'

const findDescription = (text, header) => {
  // Split the rules.MD file into lines
  let lines = text.split('\n')
  // Remove the distracting top part of the file
  const moreDetails = lines.findIndex(l => l.includes('More details'))
  lines = lines.splice(moreDetails)

  const description = lines.findIndex(l => l.includes(header))

  // Edge case? Something is strange about the file
  if (header === 'equal_shape_distance_diff_coordinates') {
    return lines[description + 4]
  }

  return lines[description + 2]
}

fetch(
  'https://raw.githubusercontent.com/MobilityData/gtfs-validator/master/RULES.md'
)
  .then((raw) => raw.text())
  .then((text) => {
    // Match all rule headings
    const rules = text
      .match(/### .*/g)
      .filter((rule) => rule.includes('_'))
      .map((rule) => rule.split('### ')[1])

    // Extract descriptions
    const rulesAndDescriptions = rules.map((rule) => ({
      rule,
      description: findDescription(text, rule)
    }))
    writeFileSync('lib/manager/components/validation/rules.json', JSON.stringify(rulesAndDescriptions))
  })
