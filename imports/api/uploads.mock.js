import faker from 'faker' ;

const randomDimension = () => faker.random.number({min: 32, max: 128}) ;

import { Uploads } from './uploads.js' ;

export { Uploads } ;

Factory.define('upload', Uploads.collection, {

	file: () => faker.image.dataUri(randomDimension(), randomDimension(), /* random color ? */),
	fileName: () => faker.system.fileName(),
	isBase64: true,

});
