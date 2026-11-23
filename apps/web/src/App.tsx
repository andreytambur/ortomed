import {BrowserRouter,Route,Routes,useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import CheckoutConfirm from './pages/CheckoutConfirm';
import InvoicePreview from './pages/InvoicePreview';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BranchesPage from './pages/BranchesPage';
import KneeGuide from './pages/KneeGuide';
import PatientGuideHome from './pages/PatientGuideHome';
import CategoryGuide from './pages/CategoryGuide';
import BlogPage,{BlogArticlePage} from './pages/BlogPage';
import {CartPage,FavoritesPage,PlaceholderPage,ProductDetailPage,ProductsPage} from './pages/Pages';
import './styles/main.css';
function Shell(){const {t}=useTranslation();const location=useLocation();if(location.pathname==='/admin-demo')return <AdminDashboard/>;return <><Header/><Routes>
 <Route path="/" element={<Home/>}/><Route path="/produse" element={<ProductsPage/>}/><Route path="/produs/:id" element={<ProductDetailPage/>}/><Route path="/cos" element={<CartPage/>}/><Route path="/favorite" element={<FavoritesPage/>}/><Route path="/partener" element={<PartnerDashboard/>}/>
 <Route path="/filiale" element={<BranchesPage/>}/><Route path="/oferte" element={<PlaceholderPage title={t('offers')}/>}/><Route path="/despre-noi" element={<PlaceholderPage title={t('about')}/>}/><Route path="/ghid-pacient" element={<PatientGuideHome/>}/><Route path="/ghid-pacient/categorie/:categoryId" element={<CategoryGuide/>}/><Route path="/ghid-pacient/orteze-genunchi" element={<KneeGuide/>}/><Route path="/blog" element={<BlogPage/>}/><Route path="/blog/:slug" element={<BlogArticlePage/>}/><Route path="/contact" element={<PlaceholderPage title={t('contact')}/>}/><Route path="/solicita-consultatie" element={<PlaceholderPage title={t('consultation')}/>}/><Route path="/urmareste-comanda" element={<PlaceholderPage title={t('track')}/>}/><Route path="/finalizare-comanda" element={<Checkout/>}/><Route path="/confirmare" element={<CheckoutConfirm/>}/><Route path="/cont-de-plata" element={<InvoicePreview/>}/><Route path="/livrare-si-plata" element={<PlaceholderPage title={t('shipping')}/>}/><Route path="/garantie-si-retur" element={<PlaceholderPage title={t('returns')}/>}/><Route path="/termeni" element={<PlaceholderPage title={t('terms')}/>}/><Route path="/confidentialitate" element={<PlaceholderPage title={t('privacy')}/>}/><Route path="*" element={<PlaceholderPage title="404"/>}/>
 </Routes><Footer/></>}
export default function App(){return <BrowserRouter><Shell/></BrowserRouter>}
