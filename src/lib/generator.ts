import { status, type Image } from "./types"
import { progressStore } from "./store/processInfo";
import { v4 as uuidv4 } from "uuid"
import PDFWorker from './worker/pdf?worker'

class genPDF {
    images: Image[]
    progress: number = 0
    state: status = status.Pending
    interrupt: boolean = false
    id: string = uuidv4()
    worker = new PDFWorker()
    filename: string

    constructor(listOfImages: Image[]) {
        this.images = listOfImages
        this.filename = `${new Date().toISOString()}.pdf`
        this.worker.onmessage = (ev: MessageEvent) => {
            const { progress, stat, blob } = ev.data;
            this.progress = progress
            this.state = stat

            progressStore.update(processes => {
                processes[this.id] = { id: this.id, progress: this.progress, state: this.state, filename: this.filename };
                return processes;
            });

            if (blob) {
                const a = document.createElement("a");
                const url = window.URL.createObjectURL(blob);

                document.body.appendChild(a);
                a.style.display = "none";
                a.href = url;
                a.download = this.filename;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        }
    }

    generatePDF() {
        let workerPayload: {
            blob: string,
            dimension: {
                x: number,
                y: number,
            }
        }[] = []
        this.images.forEach((img) => {
            workerPayload.push({
                blob: img.el.src,
                dimension: {
                    x: img.el.naturalWidth,
                    y: img.el.naturalHeight,
                }
            })
        })
        this.worker.postMessage(workerPayload)
    }
}

export default genPDF