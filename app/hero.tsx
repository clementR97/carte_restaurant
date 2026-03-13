import hero from '../public/hero.png';

export default function Hero(){


    return(
        <>
        <div>
            <img src={hero.src} className='w-full h-full object-cover' />
        </div>
        </>
    )
}