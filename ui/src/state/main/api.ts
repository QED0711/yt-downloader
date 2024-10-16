import { MainInstance } from "./types";

import { API_BASE_URL } from "../../config/environment";
import axios from "axios";
import { DownloadFormat } from "../../types";

const api = axios.create({
    baseURL: API_BASE_URL
})

export default {
    getVideoInformation(this: MainInstance): Promise<Record<string, any> | null>  {
        const urls = this.getters.getUrlsFromUrlString();
        return new Promise(resolve => {
            api.post("/info", { urls })
                .then(response => {
                    let formats = response.data?.formats;
                    if(formats) {

                        formats = formats.map((format: DownloadFormat) => {
                            if(format.resolution === "audio only"){
                                format.pixelCount = 0;
                                return format
                            }
                            const dims = format.resolution.match(/\d+/g)?.map(d => d ? Number(d) : 0) as number[]
                            format.pixelCount = dims[0] * dims[1]
                            return format;
                        })

                        this.setters.setFormats(formats.sort((a: DownloadFormat, b: DownloadFormat) => a.pixelCount - b.pixelCount))
                        resolve(response.data)

                    }
                })
                .catch(err => {
                    console.error(err)
                    resolve(null)
                })
        })
    },

    download(this: MainInstance, format_id: string, audioBook: boolean){
        const urls = this.getters.getUrlsFromUrlString()
        return new Promise(resolve => {
            api.post("/download", {urls, format_id, audio_book: audioBook})
                .then(response => {
                    resolve(response.data);
                })
                .catch(err => {
                    console.error(err);
                    resolve(null);
                })
        })
    }
}