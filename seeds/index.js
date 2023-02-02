const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

main().catch((err) => console.log(err))

async function main() {
	await mongoose.connect('mongodb://localhost:27017/yelp-camp')
	console.log('mongo connected')
}

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
	await Campground.deleteMany({})
	for (let i = 0; i < 200; i++) {
		const random1000 = Math.floor(Math.random() * 1000)
		const price = Math.floor(Math.random() * 20) + 10
		const c = new Campground({
			author: '63a370d7bb2f1cfe5bec4f8d',
			title: `${sample(descriptors)} ${sample(places)}`,
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			geometry: {
				type: 'Point',
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude,
				],
			},
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit laudantium excepturi eaque porro voluptatem dignissimos nesciunt numquam. Blanditiis sed, est nulla, neque consequatur doloremque perspiciatis, deserunt inventore dicta amet culpa.',
			price,
			images: [
				{
					url: 'https://res.cloudinary.com/dxbzza0xl/image/upload/v1671893675/YelpCamp/photo-1497900304864-273dfb3aae33_gglu8s.jpg',
					filename: 'YelpCamp/photo-1497900304864-273dfb3aae33_gglu8s',
				},
				{
					url: 'https://res.cloudinary.com/dxbzza0xl/image/upload/v1671893735/YelpCamp/photo-1445308394109-4ec2920981b1_ywqrio.jpg',
					filename: 'YelpCamp/photo-1445308394109-4ec2920981b1_ywqrio',
				},
				{
					url: 'https://res.cloudinary.com/dxbzza0xl/image/upload/v1671893712/YelpCamp/photo-1586890662737-9f107825e147_sggj3f.jpg',
					filename: 'YelpCamp/photo-1586890662737-9f107825e147_sggj3f',
				},
			],
			images: [
				{
					url: 'https://res.cloudinary.com/dxbzza0xl/image/upload/v1671893675/YelpCamp/photo-1497900304864-273dfb3aae33_gglu8s.jpg',
					filename: 'YelpCamp/photo-1497900304864-273dfb3aae33_gglu8s',
				},
				{
					url: 'https://res.cloudinary.com/dxbzza0xl/image/upload/v1671893735/YelpCamp/photo-1445308394109-4ec2920981b1_ywqrio.jpg',
					filename: 'YelpCamp/photo-1445308394109-4ec2920981b1_ywqrio',
				},
				{
					url: 'https://res.cloudinary.com/dxbzza0xl/image/upload/v1671893712/YelpCamp/photo-1586890662737-9f107825e147_sggj3f.jpg',
					filename: 'YelpCamp/photo-1586890662737-9f107825e147_sggj3f',
				},
			],
		})
		await c.save()
	}
}

seedDB().then(() => {
	mongoose.connection.close()
})
