import hero from '../public/hero.png';

export default function Hero(){


    return(
        <>
        <div className="relative mt-43">
            <img src={hero.src} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center ">
                <h1 className="text-4xl font-bold text-white mb-4">KaruFoods</h1>
                <p className="text-2xl text-white max-w-xl capitalize mb-6">
                    Le Gouts des Caraibes Burgers, bokits et snacks délicieux
                </p>
                <button className="bg-sky-400 hover:bg-sky-500 text-white text-sm px-4 py-2 md:text-lg md:px-8 md:py-4 rounded-full shadow-md">
                    Commander maintenant
                </button>
            </div>
        </div>
        </>
    )
}