import Link from "next/link"
import Image from "next/image"

const NavBar = () => {
  return (
    <header>
        <nav>
            <Link href='/' className="logo">
                <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
            
                <p>DevEvent</p>
            </Link>

            <ul>
                <Link href='/events'>Home</Link>
                <Link href='/about'>Event</Link>
                <Link href='/contact'>Create Event</Link>
            </ul>
        </nav>
    </header>
  )
}

export default NavBar