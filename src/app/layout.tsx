import './globals.css';
import {Providers} from '@/components/Providers';
export const metadata={title:'Depth Lab',description:'Learn to explain, question, and apply what you know.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers><div className="shell"><header><a className="brand" href="/">Depth<span>Lab</span></a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/library">Library</a><a href="/reviews">Reviews</a><a href="/progress">Progress</a><a href="/settings">Account</a></nav></header><main>{children}</main><footer>Depth Lab · Learn with evidence, return with curiosity.</footer></div></Providers></body></html>}
