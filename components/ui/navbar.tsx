import Image from "next/image";

export default function NavBar(){
    return (
        <header className="dark flex w-full justify-center items-center">
            <Image loading="eager" src="/logo.jpeg" alt="Logo" width={150} height={50}></Image>
        </header>
    )
}