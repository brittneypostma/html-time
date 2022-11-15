import { Context } from 'https://edge.netlify.com'

export default async (context: Context) => {
	let locationLabel
	let timezone
	let locale
	try {
		const city = context?.geo?.city
		const country = context?.geo?.country?.name
		locationLabel = `${city}, ${country}`
		timezone = context?.geo?.timezone || 'Asia/Jakarta'
		const options = Intl.DateTimeFormat().resolvedOptions()
		locale = options.locale
	} catch (error) {
		throw new Error(error.message)
	}

	// Generate a formatted time string
	const time = new Date().toLocaleString(locale, {
		timeZone: timezone,
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	})
	try {
		// Get the page content
		const response = await context.next()
		const page = await response.text()

		// Replace the content
		const regex_time = /CURRENT_TIME/gi
		const regex_place = /CURRENT_LOCATION/gi
		let updatedPage = page.replace(regex_time, time)
		updatedPage = updatedPage.replace(regex_place, locationLabel)
		return new Response(updatedPage, response)
	} catch (e) {
		return new Error(e.message)
	}
}
