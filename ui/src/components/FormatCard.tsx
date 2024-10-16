import React, { useState } from 'react';
import { DownloadFormat } from '../types';
import mainManager from '../state/main/mainManager';
import { PiBookOpenText } from 'react-icons/pi';

// TYPES
interface IFormatCard {
    format: DownloadFormat
}

// EVENTS
const handleDownloadClick = (format_id: string, audioBook: boolean) => () => {
    mainManager.api.download(format_id, audioBook)
}

const FormatCard: React.FC<IFormatCard> = ({format}) => {

    const [audioBook, setAudioBook] = useState<boolean>(false)

    return (
        <div className='grid grid-cols-5 px-4 md:px-8 py-2 text-center bg-neutral-50 border-b border-gray-200'>
            <div>{format.ext}</div>
            <div>{format.resolution}</div>
            <div>{format.filesize ? `${((format.filesize ?? 0)/1e6).toFixed(2)}mb` : "???"}</div>
            <div>
                <button
                    className={`relative top-1 px-2 rounded-full ${audioBook ? "bg-green-200 border border-gray-800 shadow-sm shadow-gray-800" : "bg-gray-200"} disabled:opacity-30 disabled:cursor-not-allowed`} 
                    disabled={format.resolution !== "audio only"}
                    onClick={() => setAudioBook(ab => !ab)}
                    title="convert to audio book format"
                >
                    <PiBookOpenText className='text-xl' />
                </button>
            </div>
            <div>
                <button 
                    onClick={handleDownloadClick(format.format_id, audioBook)}
                >
                    Download
                </button>
            </div>
        </div>
    )
}

export default FormatCard;