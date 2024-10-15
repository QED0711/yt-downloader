import React, { useState } from 'react';
import { DownloadFormat } from '../types';
import mainManager from '../state/main/mainManager';

// TYPES
interface IFormatCard {
    format: DownloadFormat
}

// EVENTS
const handleDownloadClick = (ext: string, audioBook: boolean) => () => {
    mainManager.api.download(ext, audioBook)
}

const FormatCard: React.FC<IFormatCard> = ({format}) => {

    const [audioBook, setAudioBook] = useState<boolean>(false)

    return (
        <div className='grid grid-cols-4 px-4 md:px-8 py-2 text-center bg-neutral-50 border-b border-gray-200'>
            <div>{format.ext}</div>
            <div>{format.resolution}</div>
            <div>
                <button
                    className={`px-2 rounded-full ${audioBook ? "bg-green-200" : "bg-gray-200"} disabled:opacity-30 disabled:cursor-not-allowed`} 
                    disabled={format.resolution !== "audio only"}
                    onClick={() => setAudioBook(ab => !ab)}
                >
                    Audio Book
                </button>
            </div>
            <div>
                <button 
                    onClick={handleDownloadClick(format.ext, audioBook)}
                >
                    Download
                </button>
            </div>
        </div>
    )
}

export default FormatCard;