import jsPDF from "jspdf";

/**
 * @param {string | any[]} imageData
 */
function generatePDFInWorker(imageData) {
    if (imageData.length === 0) {
        postMessage({ progress: 0, stat: 1 });
        return;
    }

    const doc = new jsPDF({ format: 'a4' });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    for (let i = 0; i < imageData.length; i++) {
        const image = imageData[i];
        const imgWidth = image.dimension.x;
        const imgHeight = image.dimension.y;

        const scale = Math.min(width / imgWidth, height / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;

        doc.addImage(image.blob, 'JPEG', x, y, scaledWidth, scaledHeight);

        const progress = (i + 1) / imageData.length;
        postMessage({ progress, stat: 3 });

        if (i < imageData.length - 1) {
            doc.addPage();
        }
    }
    const pdfBlob = doc.output('blob');

    postMessage({ progress: 1, stat: 0, blob: pdfBlob });
}

onmessage = (event) => {
    const imageData = event.data;
    generatePDFInWorker(imageData);
};
