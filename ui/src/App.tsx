import React, { useLayoutEffect, useRef, useState } from 'react'
import { useSpiccatoState } from 'spiccato-react'
import mainManager from './state/main/mainManager'
import { TbAnalyzeFilled } from 'react-icons/tb'
import type { DownloadFormat } from './types'
import FormatCard from './components/FormatCard'
import { useWindowSize } from './utils/hooks'


// TYPES
type mainState = {
  videoUrl: string,
  analyzing: string,
  formats: DownloadFormat[]
}

// EVENTS
const handleAnalyzeClick = async () => {
  mainManager.setters.setFormats([]);
  mainManager.setters.setAnalyzing(true);
  await mainManager.api.getVideoInformation();
  mainManager.setters.setAnalyzing(false);
}

// RENDERERS
const renderFormatCards = (formats: DownloadFormat[]) => {
  return formats.map(format => (
    <FormatCard key={format.format_id} format={format} />
  ))
}

// EFFECTS
const useSizeFormatContainer = (formatRef: React.RefObject<HTMLDivElement>, formats: DownloadFormat[]) => {
  const size = useWindowSize();
  const [maxHeight, setMaxHeight] = useState<number>(0)
  useLayoutEffect(() => {
    const rect = formatRef.current?.getBoundingClientRect(); 
    if(rect) {
      setMaxHeight(window.innerHeight - rect.top - 32)
    }
  }, [formats, size])

  return maxHeight;
}

function App() {
  const { state } = useSpiccatoState<mainState>(mainManager, [mainManager.paths.videoUrl, mainManager.paths.analyzing, mainManager.paths.formats])
  const formatRef = useRef<HTMLDivElement>(null);
  const maxHeight = useSizeFormatContainer(formatRef, state.formats);
  console.log(maxHeight)
  return (
    <main className='w-screen h-screen p-12 overflow-none bg-neutral-700'>
      <div className=''>
        <input
          className='block w-[95%] md:w-2/3 p-2 mx-auto text-center text-4xl shadow-md shadow-gray-500 rounded-sm'
          type="text"
          value={state.videoUrl}
          onChange={(e) => { mainManager.setters.setVideoUrl(e.target.value) }}
        />

        <button
          className='block w-fit py-2 px-4 my-8 mx-auto text-2xl bg-neutral-100 rounded-sm shadow-md shadow-neutral-900 disabled:opacity-20 disabled:cursor-not-allowed'
          onClick={handleAnalyzeClick}
          disabled={state.videoUrl.length === 0}
        >
          ANALYZE
          {state.analyzing && <TbAnalyzeFilled className='inline-block ml-2 animate-spin' />}
        </button>
      </div>

      <div ref={formatRef} className="w-[95%] md:w-2/3 p-2 mx-auto overflow-y-auto" style={{maxHeight}}>
        {state.formats.length > 0 && renderFormatCards(state.formats)}
      </div>
    </main>
  )
}

export default App
