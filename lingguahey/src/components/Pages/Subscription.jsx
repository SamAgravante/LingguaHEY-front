import { Grid, Box, Typography, Button, Paper, Divider, Stack, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect, useRef } from "react";
import { getUserFromToken } from "../../utils/auth";

// Background assets
import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameTextBoxBig from "../../assets/images/backgrounds/GameTextBoxBig.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";
import MonsterEditUIOuter from "../../assets/images/backgrounds/MonsterEditUIOuter.png";
import MonsterEditUIOuterLight from "../../assets/images/backgrounds/MonsterEditUIOuterLight.png";
import ForestwithShops from "../../assets/images/backgrounds/ForestwithShops.png";
import ShopUI from "../../assets/images/backgrounds/ShopUI.png";
import GameShopField from "../../assets/images/backgrounds/GameShopField.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import SummonUI from "../../assets/images/backgrounds/SummonUI.png";
import DungeonOpen from "../../assets/images/backgrounds/DungeonOpen.png";
import DungeonClosed from "../../assets/images/backgrounds/DungeonClosed.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/ItemBox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import GoldCoins from "../../assets/images/objects/GoldCoins.png";
import Tablet from "../../assets/images/objects/Tablet.png";
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png'
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import Gems from "../../assets/images/objects/Gems.png";
import Gears from "../../assets/images/objects/gears.png";
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import MCNoWeapon from '../../assets/images/characters/MCNoWeapon.png';
import WeaponBasicStaff from '../../assets/images/weapons/WeaponBasicStaff.png';

export default function Subscription() {
  const [paymentReference, setPaymentReference] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const userID = getUserFromToken().userId;
  const token = localStorage.getItem("token");
  const [subscriptionType, setSubscriptionType] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successDialogMessage, setSuccessDialogMessage] = useState("");

  const isMounted = useRef(false);
  const hasVerified = useRef(false);

  const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users`,
    timeout: 5000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await API.get(`/${userID}`);
        console.log("Fetched user data:", response.data);

        if (response.data && isMounted.current) {
          setIsSubscribed(response.data.subscriptionStatus);
          setSubscriptionType(response.data.subscriptionType || "");
          if (response.data.subscriptionEndDate) {
            const endDate = new Date(response.data.subscriptionEndDate);
            setSubscriptionEndDate(endDate);
          }
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    isMounted.current = true;
    checkSubscriptionStatus();

    return () => {
      isMounted.current = false;
    };
  }, [userID]);

  useEffect(() => {
    const verifyPayment = async () => {
      const storedReference = localStorage.getItem("paymentReference");
      if (storedReference && !isSubscribed && !isVerifying && !hasVerified.current) {
        setIsVerifying(true);
        hasVerified.current = true;
        try {
          await checkPaymentStatus(storedReference);
        } finally {
          if (isMounted.current) {
            setIsVerifying(false);
          }
        }
      }
    };

    verifyPayment();
  }, [isSubscribed, isVerifying]);

  const checkPaymentStatus = async (referenceNumber) => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: "Basic c2tfdGVzdF96TnJRa2kzMnNaRWgxRVRQQWRFRWY3czE6",
      },
    };

    try {
      const response = await fetch(
        `https://api.paymongo.com/v1/links?reference_number=${referenceNumber}`,
        options
      );
      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }
      const data = await response.json();

      if (!isMounted.current) return;

      const paymentStatus = data?.data?.[0]?.attributes?.status;
      const selectedPlan = localStorage.getItem("selectedPlan");

      if (paymentStatus === "paid") {
        const startDate = new Date();
        const endDate = new Date();

        let subscriptionType;
        if (selectedPlan === "Premium Plus") {
          subscriptionType = "PREMIUM_PLUS";
          endDate.setMonth(endDate.getMonth() + 6);
        } else {
          subscriptionType = "PREMIUM";
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const updateResponse = await API.put(`/update-subscription/${userID}`, {
          subscriptionStatus: true,
          subscriptionType: subscriptionType,
          subscriptionStartDate: startDate.toISOString(),
          subscriptionEndDate: endDate.toISOString()
        });

        if (updateResponse.status === 200 && isMounted.current) {
          setIsSubscribed(true);
          setSubscriptionType(subscriptionType);
          setSubscriptionEndDate(endDate);

          localStorage.removeItem("paymentReference");
          localStorage.removeItem("selectedPlan");

          setSuccessDialogMessage("Subscription activated successfully!");
          setSuccessDialogOpen(true);
        }
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Error checking payment status:", error);
        setErrorDialogMessage("Error updating subscription. Please try again or contact support.");
        setErrorDialogOpen(true);
      }
    }
  };

  const handlePayment = async (plan, amount) => {
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
            amount: amount * 100,
            description: `${plan} Subscription`,
          },
        },
      },
    };

    try {
      const response = await axios.request(options);
      const paymentLink = response?.data?.data?.attributes?.checkout_url;
      const referenceNumber = response?.data?.data?.attributes?.reference_number;

      if (paymentLink) {
        setPaymentReference(referenceNumber);
        localStorage.setItem("paymentReference", referenceNumber);
        localStorage.setItem("selectedPlan", plan);
        window.open(paymentLink, "_blank");
      } else {
        setErrorDialogMessage("Payment link not found. Please try again.");
          setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error("Error making payment request:", error);
      setErrorDialogMessage("Failed to create the payment link. Please try again.");
      setErrorDialogOpen(true);
    }
  };

  const subscriptionPlans = [
    {
      name: "Free",
      price: "₱0",
      duration: "Basic",
      features: [
        "Full vocabulary access",
        "Create up to 1 classroom",
        "Live activities"
      ],
      recommended: false,
      buttonText: "CURRENT PLAN",
      buttonDisabled: true,
      amount: 0
    },
    {
      name: "Premium",
      price: "₱149",
      duration: "for 1 month",
      features: [
        "Full vocabulary access",
        "Create up to 5 classrooms",
        "Live activities"
      ],
      recommended: true,
      buttonText: "CHOOSE THIS PLAN",
      amount: 149
    },
    /*
    {
      name: "Premium Plus",
      price: "₱1,000",
      duration: "for 6 months",
      features: [
        "All features in 1 Month plan",
        "Personalized learning path",
        "Premium content access"
      ],
      recommended: false,
      buttonText: "CHOOSE THIS PLAN",
      amount: 1000
    }
    */ 
  ];

  return (
    <Box
      sx={{
        minHeight: "96.5%",
        width: "98%",
        overflow: "hidden",
        backgroundImage: `url(${MonsterEditUIOuterLight})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      {isSubscribed ? (
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            maxWidth: 600,
            p: 4,
            borderRadius: 3,
            backgroundColor: "#FFF3E0",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            border: "2px solid #FB8C00"
          }}
        > 
          <CheckCircleIcon sx={{ fontSize: 80, color: "#FB8C00", mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2, color: "#E65100", textAlign: "center", fontWeight: "bold" }}>
            {subscriptionType === "PREMIUM_PLUS" ? "Premium Plus" : "Premium"} Subscription
          </Typography>
          <Typography variant="h6" sx={{ mb: 2, color: "#F57C00", textAlign: "center" }}>
            Your subscription is active!
          </Typography>
          <Divider sx={{ width: "100%", my: 2, borderColor: "#FFE0B2" }} />
          <Box sx={{ width: "100%", mt: 2 }}>
            <Typography variant="h6" sx={{ color: "#E65100", mb: 2, fontWeight: "bold" }}>
              Subscription Details:
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckIcon sx={{ color: "#FB8C00", mr: 1 }} />
                <Typography variant="body1" sx={{ color: "#F57C00" }}>
                  Plan Type: {subscriptionType === "PREMIUM_PLUS" ? "Premium Plus (6 Months)" : "Premium (1 Month)"}
                </Typography>
              </Box>
              {subscriptionEndDate && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CheckIcon sx={{ color: "#FB8C00", mr: 1 }} />
                  <Typography variant="body1" sx={{ color: "#F57C00" }}>
                    Valid until: {new Date(subscriptionEndDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckIcon sx={{ color: "#FB8C00", mr: 1 }} />
                <Typography variant="body1" sx={{ color: "#F57C00" }}>
                  {subscriptionType === "PREMIUM_PLUS" ?
                    "Full access to all premium features plus exclusive content" :
                    "Full access to all premium features"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CheckIcon sx={{ color: "#FB8C00", mr: 1 }} />
                <Typography variant="body1" sx={{ color: "#F57C00" }}>
                  {subscriptionType === "PREMIUM_PLUS" ?
                    "Personalized learning path included" :
                    "Standard learning path"}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      ) : (
        // Not subscribed state - display plan options
        <>
          <Typography variant="h4" sx={{ mb: 2, color: "#4E342E", textAlign: "center" }}>
            Your current plan
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4, color: "#6D4C41", textAlign: "center" }}>
            Free
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: 1200 }}>
            {subscriptionPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: "115%",
                    width: "80%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    //border: plan.recommended ? "2px solid #FB8C00" : "1px solid #FFE082",
                    overflow: "hidden",
                    backgroundImage: `url(${GameTextFieldBig})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {plan.recommended && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        backgroundColor: "#FB8C00",
                        color: "white",
                        py: 0.5,
                        textAlign: "center"
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold">
                        Recommended
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: "center",
                      mt: plan.recommended ? 2 : 1,
                      mb: 1
                    }}
                  >
                    {plan.name}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "baseline",
                      mb: 2,
                      mt: 1
                    }}
                  >
                    <Typography
                      component="span"
                      variant="h4"
                      color="#4E342E"
                      fontWeight="bold"
                      sx={{ fontSize: plan.price === "₱1,000" ? "2rem" : "2.25rem" }}
                    >
                      {plan.price}
                    </Typography>
                    {plan.duration && (
                      <Typography component="span" variant="subtitle1" color="text.secondary" sx={{ ml: 1 }}>
                        {plan.duration}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    disabled={plan.buttonDisabled}
                    onClick={() => handlePayment(plan.name, plan.amount)}
                    sx={{
                      backgroundColor: plan.buttonDisabled ? "#E0E0E0" : "#FB8C00",
                      "&:hover": { backgroundColor: "#F57C00" },
                      "&.Mui-disabled": { backgroundColor: "#E0E0E0", color: "#9E9E9E" },
                      borderRadius: 6,
                      py: 1.5,
                      mb: 2,
                      mt: "auto"
                    }}
                  >
                    {plan.buttonText}
                  </Button>


                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {plan.features.map((feature, idx) => (
                      <Box key={idx} sx={{ display: "flex", alignItems: "flex-start" ,width: 350}}>
                        <CheckIcon sx={{ fontSize: 20, color: "#FB8C00", mr: 1, mt: 0.2 }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {paymentReference && (
            <Paper
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: "#FFFDE7",
                borderLeft: "4px solid #FB8C00",
                marginTop: 15,
                maxWidth: 600
              }}
            >
              <Typography variant="body1" sx={{ color: "#4E342E" }}>
                Payment initiated! Please refresh the page after completing your payment to update your subscription status.
              </Typography>
            </Paper>
          )}
        </>
      )}
    <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle
          sx={{
            borderTop: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}
        >
          Error
        </DialogTitle>
        <DialogContent
          sx={{
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}
        >
          <DialogContentText sx={{ bgcolor: '#F7CB97' }}>{errorDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            borderBottom: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}
        >
          <Button onClick={() => setErrorDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        <DialogTitle
          sx={{
            borderTop: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}
        >
          Success
        </DialogTitle>
        <DialogContent
          sx={{
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}
        >
          <DialogContentText sx={{ bgcolor: '#F7CB97' }}>{successDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            borderBottom: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}
        >
          <Button onClick={() => setSuccessDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}