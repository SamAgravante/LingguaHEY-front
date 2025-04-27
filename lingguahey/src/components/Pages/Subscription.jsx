import { Grid, Box, Typography, Button } from "@mui/material";
import axios from "axios";
import PaymentIcon from "@mui/icons-material/Payment";

export default function Subscription() {
  const handlePayment = async () => {
    const options = {
      method: "POST",
      url: "https://api.paymongo.com/v1/links",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: "Basic c2tfdGVzdF96TnJRa2kzMnNaRWgxRVRQQWRFRWY3czE6",
      },
      data: {
        data: {
          attributes: {
            amount: 100000,
            description: "Subscription",
          },
        },
      },
    };

    try {
      const response = await axios.request(options);
      const paymentLink = response?.data?.data?.attributes?.checkout_url;

      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        alert("Payment link not found. Please try again.");
      }
    } catch (error) {
      console.error("Error making payment request:", error);
      alert("Failed to create the payment link. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "95vh",
        width: "98vw",
        backgroundColor: "#FFF8E1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          backgroundColor: "#FFE082",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, color: "#4E342E", textAlign: "center" }}>
          Subscription Now!
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: "#6D4C41", textAlign: "center" }}>
          Get full access by subscribing!
        </Typography>

        <PaymentIcon sx={{ fontSize: 80, color: "#FB8C00", mb: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 2, color: "#4E342E" }}>
          Subscribe for ₱1000
        </Typography>

        <Button
          variant="contained"
          onClick={handlePayment}
          sx={{
            backgroundColor: "#FB8C00",
            "&:hover": { backgroundColor: "#F57C00" },
            px: 4,
            py: 1,
            fontSize: "1rem",
            borderRadius: 2,
          }}
        >
          Make Payment
        </Button>
      </Grid>
    </Box>
  );
}
