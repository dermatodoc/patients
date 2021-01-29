import saveTextAs from '../../../client/saveTextAs.js';

const downloadDocument = (document) => {
	const extensions = {
		healthone: 'HLT'
		// 'medar' : 'MDR' ,
		// 'medidoc' : 'MDD' ,
	};

	const ext = extensions[document.format] || 'UNK';

	const name = document.parsed
		? `${document.identifier}-${document.reference}-${document.status}`
		: `${document._id}`;

	const filename = `${name}.${ext}`;

	saveTextAs(document.decoded || document.source, filename);
};

export default downloadDocument;
