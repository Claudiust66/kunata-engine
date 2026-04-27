import './globals.css';
import Navbar from './components/Navbar'; // Import the client component

export const metadata = {
  title: 'Kunata | Valuation SaaS',
  description: 'Pennarth Greene Financial Intelligence',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans">
        <Navbar /> 
        <main>{children}</main>
      </body>
    </html>
  );
}