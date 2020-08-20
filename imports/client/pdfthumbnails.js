import pdfjs from 'pdfjs-dist';

// "pages": doc.pdfInfo.numPages

function createContext(page, desiredWidth, desiredHeight) {
	const viewport = page.getViewport({scale: 1});

	let scale = 1;

	if (desiredWidth !== undefined && desiredHeight === undefined) {
		scale = desiredWidth / viewport.width;
	}

	if (desiredHeight !== undefined && desiredWidth === undefined) {
		scale = desiredHeight / viewport.height;
	}

	const scaledViewport = page.getViewport({scale});

	const canvas = document.createElement('canvas');
	canvas.width = desiredWidth || scaledViewport.width;
	canvas.height = desiredHeight || scaledViewport.height;

	const ctx = canvas.getContext('2d');

	return {
		canvasContext: ctx,
		viewport: scaledViewport
	};
}

export function thumbnail(
	file,
	{page = 1, width, height, type, encoderOptions} = {}
) {
	// A Promise
	return pdfjs
		.getDocument(file)
		.promise.then((doc) => doc.getPage(page))
		.then((thepage) => {
			const renderContext = createContext(thepage, width, height);
			return thepage.render(renderContext).promise.then(() => renderContext);
		})
		.then((renderContext) => {
			const canvas = renderContext.canvasContext.canvas;
			const dataURL = canvas.toDataURL(type, encoderOptions);
			canvas.remove();
			return dataURL;
		});
}
