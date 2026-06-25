/**
 * Single content source for the site, derived from /static/meridian-profile.md.
 */

export const COMPANY = {
	name: 'Meridian 3PL',
	phone: '+61 487 295 376',
	phoneHref: 'tel:+61487295376',
	email: 'hello@meridian3pl.com.au',
	address: '4/22 West Court, Derrimut',
	city: 'Melbourne, VIC, Australia',
	coordinates: '37.7833° S / 144.7667° E',
	mapsUrl: 'https://www.google.com/maps/search/?api=1&query=4%2F22+West+Court+Derrimut+VIC+Australia'
} as const;

export const NAV_LINKS = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/services', label: 'Services' },
	{ href: '/industries', label: 'Industries' },
	{ href: '/contact', label: 'Contact' }
] as const;

export interface Service {
	slug: string;
	index: string;
	title: string;
	short: string;
	tagline: string;
	description: string;
	features: string[];
	benefits: string[];
	image: string;
	imageAlt: string;
}

export const SERVICES: Service[] = [
	{
		slug: 'warehousing',
		index: '01',
		title: 'Warehousing Solutions',
		short: 'Warehousing',
		tagline: 'Secure, scalable storage — engineered around your inventory.',
		description:
			'Our secure and strategically managed warehousing facilities give your business flexible storage designed to accommodate varying inventory requirements — from a single pallet to full-scale overflow.',
		features: [
			'Short-term and long-term storage',
			'Secure inventory handling',
			'Organised product storage systems',
			'Inventory visibility and tracking',
			'Scalable warehouse capacity',
			'Goods receiving and inspection'
		],
		benefits: [
			'Reduced storage costs',
			'Improved inventory control',
			'Enhanced operational efficiency',
			'Flexible space utilisation'
		],
		image: '/images/racks-moody.jpg',
		imageAlt: 'Tall pallet racking inside a Meridian 3PL warehouse facility'
	},
	{
		slug: 'fulfillment',
		index: '02',
		title: 'Pick & Pack Fulfilment',
		short: 'Pick & Pack',
		tagline: 'From order received to shipment ready — accurately, every time.',
		description:
			'We manage the complete order fulfilment process, from receiving customer orders to preparing shipments accurately and efficiently — so your customers get exactly what they ordered, fast.',
		features: [
			'Order processing',
			'Product picking',
			'Packaging and labelling',
			'Quality control checks',
			'Order consolidation',
			'Shipment preparation'
		],
		benefits: [
			'Faster order fulfilment',
			'Reduced order errors',
			'Improved customer experience',
			'Lower operational overhead'
		],
		image: '/images/fulfillment-floor.jpg',
		imageAlt: 'Fulfilment floor with organised pick bins and packing stations'
	},
	{
		slug: 'inventory',
		index: '03',
		title: 'Inventory Management',
		short: 'Inventory',
		tagline: 'Real-time visibility. Total control. Zero guesswork.',
		description:
			'Our inventory management solutions provide real-time visibility and control over stock levels, helping your business maintain optimal inventory performance across every channel.',
		features: [
			'Inventory tracking',
			'Stock level monitoring',
			'Cycle counting',
			'Inventory reporting',
			'SKU management'
		],
		benefits: [
			'Reduced stock shortages',
			'Minimised excess inventory',
			'Improved forecasting accuracy',
			'Better inventory accountability'
		],
		image: '/images/hero-warehouse.jpg',
		imageAlt: 'High-bay warehouse aisle with tracked and labelled inventory'
	},
	{
		slug: 'distribution',
		index: '04',
		title: 'Shipping & Distribution',
		short: 'Distribution',
		tagline: 'Reliable networks that put product where it needs to be.',
		description:
			'Meridian 3PL offers reliable shipping and distribution services that ensure products reach customers and business locations safely and on time — across Melbourne, Victoria, and the continent.',
		features: [
			'Domestic distribution',
			'Last-mile delivery coordination',
			'Route optimisation',
			'Shipment tracking',
			'Retail distribution',
			'Multi-channel fulfilment'
		],
		benefits: [
			'Faster delivery times',
			'Reduced transportation costs',
			'Increased customer satisfaction',
			'Improved supply chain performance'
		],
		image: '/images/road-train.jpg',
		imageAlt: 'Australian road train hauling freight across the outback'
	}
];

export interface Industry {
	name: string;
	blurb: string;
	image: string;
	imageAlt: string;
}

export const INDUSTRIES: Industry[] = [
	{
		name: 'E-Commerce',
		blurb: 'Direct-to-consumer fulfilment tuned for speed, accuracy, and effortless scale across every storefront.',
		image: '/images/ind-ecommerce.jpg',
		imageAlt: 'Online store being managed from a laptop'
	},
	{
		name: 'Retail & Consumer Goods',
		blurb: 'Retail-ready distribution with compliant labelling, consolidation, and dependable store replenishment.',
		image: '/images/ind-retail.jpg',
		imageAlt: 'Curated retail store interior with apparel and goods'
	},
	{
		name: 'Manufacturing',
		blurb: 'Inbound component handling and outbound finished-goods logistics that keep production lines moving.',
		image: '/images/ind-manufacturing.jpg',
		imageAlt: 'Fabrication work with grinding sparks in a workshop'
	},
	{
		name: 'Healthcare & Pharmaceuticals',
		blurb: 'Disciplined, secure handling with the traceability and accountability sensitive products demand.',
		image: '/images/ind-healthcare.jpg',
		imageAlt: 'Pharmaceutical capsules and dispensing bottle'
	},
	{
		name: 'FMCG',
		blurb: 'High-velocity throughput for fast-moving consumer goods, with rotation discipline built in.',
		image: '/images/ind-fmcg.jpg',
		imageAlt: 'Fully stocked fast-moving consumer goods shelving'
	},
	{
		name: 'Electronics',
		blurb: 'Careful handling, serialised tracking, and secure storage for high-value technology products.',
		image: '/images/ind-electronics.jpg',
		imageAlt: 'Close-up of an electronic circuit board'
	},
	{
		name: 'Fashion & Apparel',
		blurb: 'Season-aware fulfilment with returns processing that protects both margin and brand experience.',
		image: '/images/ind-fashion.jpg',
		imageAlt: 'Apparel boutique with garments on racks'
	},
	{
		name: 'Industrial Products',
		blurb: 'Heavy, awkward, or high-spec — industrial freight handled with the right equipment and care.',
		image: '/images/ind-industrial.jpg',
		imageAlt: 'Welder working with industrial equipment'
	},
	{
		name: 'Food & Beverage',
		blurb: 'Date-code discipline and hygienic handling for shelf-stable food and beverage product lines.',
		image: '/images/ind-food.jpg',
		imageAlt: 'Artisan bread loaves with wheat'
	},
	{
		name: 'Automotive Parts',
		blurb: 'SKU-dense parts inventory managed for rapid, accurate picking — right part, right place, right time.',
		image: '/images/ind-automotive.jpg',
		imageAlt: 'Precision automotive suspension components'
	}
];

export interface ProcessStep {
	index: string;
	title: string;
	description: string;
}

export const PROCESS: ProcessStep[] = [
	{
		index: '01',
		title: 'Receive',
		description: 'Products are received, inspected, and logged into inventory systems.'
	},
	{
		index: '02',
		title: 'Store',
		description: 'Inventory is securely organised and managed within our warehouse facilities.'
	},
	{
		index: '03',
		title: 'Process',
		description: 'Orders are received, picked, packed, and prepared for shipment.'
	},
	{
		index: '04',
		title: 'Deliver',
		description: 'Products are shipped and distributed through reliable transportation networks.'
	},
	{
		index: '05',
		title: 'Report',
		description: 'You receive inventory and fulfilment insights for improved decision-making.'
	}
];

export interface Value {
	title: string;
	description: string;
}

export const VALUES: Value[] = [
	{ title: 'Reliability', description: 'We deliver consistent and dependable logistics solutions that our clients can trust.' },
	{ title: 'Excellence', description: 'We maintain the highest standards in every aspect of our operations.' },
	{ title: 'Integrity', description: 'We build lasting relationships through honesty, transparency, and accountability.' },
	{ title: 'Innovation', description: 'We leverage technology and modern logistics practices to improve efficiency.' },
	{ title: 'Customer Centricity', description: 'Our clients’ success drives every decision we make.' },
	{ title: 'Security', description: 'We prioritise the security and proper handling of goods throughout the supply chain.' }
];

export const WHY_CHOOSE = [
	{
		title: 'Strategic Logistics Expertise',
		description:
			'Our experienced team understands the complexities of modern supply chains and develops solutions tailored to each client’s needs.'
	},
	{
		title: 'Scalable Solutions',
		description:
			'Whether you’re a startup or an established enterprise, our services grow alongside your business.'
	},
	{
		title: 'Technology-Driven Operations',
		description:
			'We utilise modern inventory and fulfilment systems to provide visibility, accuracy, and efficiency.'
	},
	{
		title: 'Cost Optimisation',
		description:
			'Our solutions help businesses reduce operational costs while improving service performance.'
	},
	{
		title: 'Operational Efficiency',
		description:
			'We streamline logistics processes to eliminate bottlenecks and maximise productivity.'
	},
	{
		title: 'Dedicated Support',
		description:
			'Our team is committed to responsive communication and exceptional customer service.'
	}
] as const;

export const MISSION =
	'To empower businesses with efficient logistics services that optimise inventory management, accelerate order fulfilment, and enhance customer satisfaction through operational excellence and strategic partnerships.';

export const VISION =
	'To become the preferred logistics and fulfilment partner across the continent by delivering innovative, reliable, and scalable supply chain solutions.';

export const COMMITMENT =
	'Logistics is more than moving products — it’s about supporting business growth, protecting customer relationships, and creating seamless supply chain experiences.';
