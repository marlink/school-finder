'use client'

import { Check } from 'lucide-react'

export function Features() {
  return (
    <section className="w-full bg-background/95">
      <div className="container max-w-screen-2xl mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
          <div className="lg:col-span-7">
            {/* Grid of Images */}
            <div className="grid grid-cols-12 gap-2 sm:gap-6 items-center lg:-translate-x-10">
              <div className="col-span-4">
                <img 
                  className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300" 
                  src="https://images.unsplash.com/photo-1606868306217-dbf5046868d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=920&q=80" 
                  alt="Szkoła podstawowa z nowoczesnym wyposażeniem"
                />
              </div>
              
              <div className="col-span-3">
                <img 
                  className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300" 
                  src="https://images.unsplash.com/photo-1605629921711-2f6b00c6bbf4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=920&q=80" 
                  alt="Uczniowie podczas zajęć edukacyjnych"
                />
              </div>
              
              <div className="col-span-5">
                <img 
                  className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300" 
                  src="https://images.unsplash.com/photo-1600194992440-50b26e0a0309?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=920&q=80" 
                  alt="Nowoczesna sala lekcyjna"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-10 lg:mt-0 lg:col-span-5">
            <div className="space-y-6 sm:space-y-8">
              {/* Title */}
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-3xl font-bold lg:text-4xl text-foreground">
                  Narzędzia do znalezienia idealnej szkoły
                </h2>
                <p className="text-muted-foreground">
                  Wykorzystaj nasze narzędzia, aby znaleźć najlepszą szkołę dla Twojego dziecka. Porównuj, analizuj i podejmuj świadome decyzje edukacyjne.
                </p>
              </div>
              
              {/* List */}
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex gap-x-3">
                  <span className="mt-0.5 h-5 w-5 flex justify-center items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div className="grow">
                    <span className="text-sm sm:text-base text-muted-foreground">
                      <span className="font-medium text-foreground">Mniej czasu</span> na poszukiwania - więcej na decyzje
                    </span>
                  </div>
                </li>
                
                <li className="flex gap-x-3">
                  <span className="mt-0.5 h-5 w-5 flex justify-center items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div className="grow">
                    <span className="text-sm sm:text-base text-muted-foreground">
                      Tysiące szkół w jednym miejscu
                    </span>
                  </div>
                </li>
                
                <li className="flex gap-x-3">
                  <span className="mt-0.5 h-5 w-5 flex justify-center items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div className="grow">
                    <span className="text-sm sm:text-base text-muted-foreground">
                      Planuj edukację <span className="font-medium text-foreground">efektywnie</span>
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}