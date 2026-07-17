import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "common/consts/routes";
import HomePage from "pages/HomePage";
import OrderWizardPage from "pages/OrderWizardPage";
import OrderConfirmationPage from "pages/OrderConfirmationPage";
import OrderStatusPage from "pages/OrderStatusPage";
import DriverOverviewPage from "pages/DriverOverviewPage";
import DriverOrderPage from "pages/DriverOrderPage";
import NotFoundPage from "pages/NotFoundPage";
import App from "./components/App";
import OrderDraftScope from "./scopes/OrderDraftScope";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: routes.home, element: <HomePage /> },
      {
        element: <OrderDraftScope />,
        children: [
          { path: routes.orderWizard, element: <OrderWizardPage /> },
          {
            path: routes.orderConfirmation,
            element: <OrderConfirmationPage />,
          },
        ],
      },
      { path: routes.orderStatus, element: <OrderStatusPage /> },
      { path: routes.driverOverview, element: <DriverOverviewPage /> },
      { path: routes.driverOrder, element: <DriverOrderPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
