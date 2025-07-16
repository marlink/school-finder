'use client'

import Link from 'next/link'
import { getAppPath } from '@/lib/routeUtils'

export function Hero() {
  return (
    <div className="max-w-[85rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-14 mx-auto"> 
      {/* Grid */} 
      <div className="grid md:grid-cols-2 gap-8 md:gap-12"> 
        <div className="w-full lg:w-3/4 text-center md:text-left"> 
          <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold lg:text-4xl dark:text-white"> 
            Znajdź idealną szkołę dla swojego dziecka
          </h2> 
          <p className="mt-3 text-sm sm:text-base text-gray-800 dark:text-neutral-400"> 
            Nasza platforma pomaga rodzicom znaleźć najlepsze szkoły w okolicy, porównać je i podjąć świadomą decyzję dotyczącą edukacji swoich dzieci.
          </p> 
          <p className="mt-5"> 
            <Link 
              className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500" 
              href={getAppPath('/schools')}
            >
              Przeglądaj szkoły
              <svg className="flex-shrink-0 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link> 
          </p> 
        </div> 
        {/* End Col */} 

        <div className="space-y-4 sm:space-y-6 lg:space-y-10"> 
          {/* Icon Block */} 
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-x-8"> 
            {/* Icon */} 
            <span className="shrink-0 inline-flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 bg-white text-gray-800 shadow-xs mx-auto sm:mx-0 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"> 
              <svg className="shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
            </span> 
            <div className="grow text-center sm:text-left"> 
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"> 
                Szczegółowe profile szkół 
              </h3> 
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400"> 
                Przeglądaj szczegółowe informacje o szkołach, w tym oceny, opinie, programy nauczania i dane kontaktowe.
              </p> 
            </div> 
          </div> 
          {/* End Icon Block */} 

          {/* Icon Block */} 
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-x-8"> 
            {/* Icon */} 
            <span className="shrink-0 inline-flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 bg-white text-gray-800 shadow-xs mx-auto sm:mx-0 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"> 
              <svg className="shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg> 
            </span> 
            <div className="grow text-center sm:text-left"> 
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"> 
                Opinie społeczności 
              </h3> 
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400"> 
                Czytaj opinie innych rodziców i uczniów, aby lepiej poznać atmosferę i jakość nauczania w szkołach.
              </p> 
            </div> 
          </div> 
          {/* End Icon Block */} 

          {/* Icon Block */} 
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-x-8"> 
            {/* Icon */} 
            <span className="shrink-0 inline-flex justify-center items-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-200 bg-white text-gray-800 shadow-xs mx-auto sm:mx-0 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"> 
              <svg className="shrink-0 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg> 
            </span> 
            <div className="grow text-center sm:text-left"> 
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"> 
                Interaktywna mapa 
              </h3> 
              <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400"> 
                Znajdź szkoły w swojej okolicy dzięki interaktywnej mapie i sprawdź, jak daleko znajdują się od Twojego domu.
              </p> 
            </div> 
          </div> 
          {/* End Icon Block */} 
        </div> 
        {/* End Col */} 
      </div> 
      {/* End Grid */} 
    </div> 
  )
}