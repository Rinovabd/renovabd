/** Ribbon Modernism routes: customer commerce, protected Studio, and category paths share client-side session and cart state without exposing secrets. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { AnalyticsRouteTracker } from "@/components/AnalyticsRouteTracker";
import { SeoManager } from "@/components/SeoManager";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import OrderDocument from "./pages/OrderDocument";
import Shop from "./pages/Shop";
function Router() { return <Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/categories" component={Categories} /><Route path="/categories/:slug" component={CategoryDetail} /><Route path="/account" component={Account} /><Route path="/cart" component={Cart} /><Route path="/checkout" component={Checkout} /><Route path="/invoice/:id">{() => <OrderDocument mode="invoice" />}</Route><Route path="/track/:id">{() => <OrderDocument mode="tracking" />}</Route><Route path="/admin" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><AuthProvider><CartProvider><SeoManager /><AnalyticsRouteTracker /><AnalyticsConsent /><Toaster /><Router /></CartProvider></AuthProvider></TooltipProvider></ThemeProvider></ErrorBoundary>; }
