import { Context } from 'https://edge.netlify.com'
import iplocation from 'https://cdn.skypack.dev/iplocation'

// Note: rate limits!  https://github.com/Richienb/iplocation#providers

export default async (request: Request, context: Context) => {
	// determine location and probable locale from the IP address
	let location
	let locationLabel
	let timezone
	let locale
	try {
		location = context?.ip
		const res = await fetch(`https://ipapi.co/${location}/json/`)
		const ipData = await res.json()
		const city = context?.geo?.city
		const country = context?.geo?.country?.name
		locationLabel = `${city}, ${country}`
		const options = Intl.DateTimeFormat().resolvedOptions()
		locale = options.locale
		timezone = ipData.timezone || 'Asia/Jakarta'
	} catch (error) {
		throw new Error(error.message)
	}

	// Generate a formatted time string
	let time = new Date().toLocaleString(locale, {
		timeZone: timezone,
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	})
	// Get the page content
	const response = await context.next()
	const page = await response.text()

	// Replace the content
	const regex_time = /CURRENT_TIME/gi
	const regex_place = /CURRENT_LOCATION/gi
	let updatedPage = page.replace(regex_time, time)
	updatedPage = updatedPage.replace(regex_place, locationLabel)
	return new Response(updatedPage, response)
}
