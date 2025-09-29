'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiCustomerService2Fill, RiMoneyDollarCircleLine, RiCalendarLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: Option[];
  equipmentGrid?: Equipment[];
  showCalendar?: boolean;
  showPricing?: boolean;
  pricingData?: PricingData;
  showDurationInput?: boolean;
}

interface Option {
  id: string;
  text: string;
  value: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  equipment_count: number;
}

interface Equipment {
  id: string;
  name: string;
  description: string;
  category_name: string;
  image: string;
  pricing: {
    daily_rate: number;
    weekly_rate?: number;
    monthly_rate?: number;
    security_deposit: number;
    late_return_fee: number;
    weekly_discount?: number;
    monthly_discount?: number;
  };
  is_available: boolean;
  availability_status: string;
  specifications?: {
    operating_weight?: string;
    engine_power?: string;
    blade_capacity?: string;
    fuel_capacity?: string;
    max_speed?: string;
    dimensions?: {
      length?: string;
      width?: string;
      height?: string;
    };
  };
  features?: string[];
  rental_requirements?: {
    minimum_rental_period: number;
    maximum_rental_period: number;
    advance_booking_days: number;
    operator_license_required: boolean;
    training_required: boolean;
    age_restriction: number;
    insurance_required: boolean;
    delivery_available: boolean;
    delivery_radius: number;
    delivery_fee: number;
  };
  current_location?: string;
  pickup_location?: string;
}

interface PricingData {
  equipment: Equipment;
  startDate: string;
  endDate: string;
  duration: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  totalAmount: number;
  depositAmount: number;
}

interface ChatState {
  step: string;
  selectedCategory?: Category;
  selectedEquipmentName?: string;
  selectedEquipment?: Equipment;
  startDate?: string;
  rentalDays?: number;
  selectedPricing?: 'daily' | 'weekly' | 'monthly';
}

const CONVERSATION_STEPS = {
  WELCOME: 'welcome',
  CATEGORY_SELECTION: 'category_selection',
  EQUIPMENT_SELECTION: 'equipment_selection',
  EQUIPMENT_GRID: 'equipment_grid',
  START_DATE: 'start_date',
  RENTAL_DURATION: 'rental_duration',
  AVAILABILITY_CHECK: 'availability_check',
  PRICING_OPTIONS: 'pricing_options',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  AUTH_CHECK: 'auth_check'
};

export default function ChatBotRentalsPortfolio() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatState, setChatState] = useState<ChatState>({ step: CONVERSATION_STEPS.WELCOME });
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);

  const addBotMessage = useCallback((text: string, options?: Option[], equipmentGrid?: Equipment[], showCalendar?: boolean, showPricing?: boolean, pricingData?: PricingData, showDurationInput?: boolean) => {
    const message: Message = {
      id: generateUniqueId(),
      text,
      isBot: true,
      timestamp: new Date(),
      options,
      equipmentGrid,
      showCalendar,
      showPricing,
      pricingData,
      showDurationInput
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const initializeChatbot = useCallback(() => {
    addBotMessage(
      "Hello! I'm your equipment rental assistant. I'll help you find the perfect equipment for your project in just a few questions. How can I help you today?",
      [
        { id: 'rent', text: '🔧 I want to rent equipment', value: 'rent' },
        { id: 'info', text: 'ℹ️ Just browsing for information', value: 'info' }
      ]
    );
  }, [addBotMessage]);

  // Initialize chatbot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChatbot();
    }
  }, [isOpen, messages.length, initializeChatbot]);

  // Periodic pop-up animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowPopUp(true);
        setTimeout(() => setShowPopUp(false), 3000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const generateUniqueId = () => {
    return Date.now() + Math.random() * 1000;
  };



  const addUserMessage = useCallback((text: string) => {
    const message: Message = {
      id: generateUniqueId(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiBaseUrl}/equipments/categories/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        fetchAllEquipment();
        return data;
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
    
    // Fallback categories
    // const fallbackCategories = [
    //   { id: 1, name: 'Construction Equipment', slug: 'construction', equipment_count: 5 },
    //   { id: 2, name: 'Excavation Tools', slug: 'excavation', equipment_count: 3 },
    //   { id: 3, name: 'Concrete Mixers', slug: 'concrete', equipment_count: 4 },
    //   { id: 4, name: 'Landscaping Tools', slug: 'landscaping', equipment_count: 6 }
    // ];
    // setCategories(fallbackCategories);
    // return fallbackCategories;
  };

  const fetchAllEquipment = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      
      console.log('Fetching equipment from:', `${apiBaseUrl}/equipments/equipment/`);
      
      const response = await fetch(`${apiBaseUrl}/equipments/equipment/`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw API response:', data);
        
        const equipmentList = data.results || data;
        console.log('Equipment list:', equipmentList);
        
        // Process images to ensure they have proper URLs
        const processedEquipment = equipmentList.map((eq: Equipment) => {
          // If image URL doesn't start with http, prepend API base URL
          if (eq.image && !eq.image.startsWith('http')) {
            eq.image = `${apiBaseUrl}${eq.image}`;
          }
          return eq;
        });
        
        console.log('Processed equipment:', processedEquipment);
        setAllEquipment(processedEquipment);
      } else {
        console.error('Failed to fetch equipment:', response.status, response.statusText);
        // Try to read error response
        try {
          const errorText = await response.text();
          console.error('Error response:', errorText);
        } catch {
          console.error('Could not read error response');
        }
      }
    } catch (error) {
      console.error('Failed to fetch all equipment:', error);
    } finally {
      setLoading(false);
    }
  };



  const checkAvailability = async (equipmentId: string, startDate: string, endDate: string) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const response = await fetch(`${apiBaseUrl}/equipments/equipment/${equipmentId}/bookings/`);
      if (response.ok) {
        const bookings = await response.json();
        
        // Check for conflicts
        const hasConflict = bookings.some((booking: { start_date: string; end_date: string }) => {
          const bookingStart = new Date(booking.start_date);
          const bookingEnd = new Date(booking.end_date);
          const requestStart = new Date(startDate);
          const requestEnd = new Date(endDate);
          
          return (requestStart <= bookingEnd && requestEnd >= bookingStart);
        });
        
        return !hasConflict;
      } else {
        console.error('Failed to check availability:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to check availability:', error);
    }
    
    // Default to available if API fails
    return true;
  };

  const handleOptionClick = async (option: Option) => {
    addUserMessage(option.text);
    
    switch (chatState.step) {
      case CONVERSATION_STEPS.WELCOME:
        await handleWelcomeResponse(option.value);
        break;
      case CONVERSATION_STEPS.CATEGORY_SELECTION:
        await handleCategorySelection(option.value);
        break;
      case CONVERSATION_STEPS.EQUIPMENT_SELECTION:
        await handleEquipmentSelection(option.value);
        break;
      case CONVERSATION_STEPS.RENTAL_DURATION:
        handleRentalDuration(option.value);
        break;
      case CONVERSATION_STEPS.PRICING_OPTIONS:
        await handlePricingSelection(option.value);
        break;
      case CONVERSATION_STEPS.AUTH_CHECK:
        if (option.value === 'login') {
          // Redirect to login page with return URL
          const returnUrl = `/equipments/${chatState.selectedEquipment?.id}/rent`;
          router.push(`/dashboard/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          setIsOpen(false);
        } else if (option.value === 'restart') {
          restartConversation();
        }
        break;
      default:
        if (option.value === 'restart') {
          restartConversation();
        } else if (option.value === 'contact') {
          router.push('/equipments/contact');
          setIsOpen(false);
        } else if (option.value === 'browse') {
          router.push('/equipments');
          setIsOpen(false);
        } else if (option.value === 'book_now') {
          handleBookNow();
        } else if (option.value === 'change_dates') {
          handleChangeDates();
        } else if (option.value === 'change_pricing') {
          handleChangePricing();
        }
    }
  };

  const handleWelcomeResponse = async (value: string) => {
    if (value === 'rent') {
      setChatState({ step: CONVERSATION_STEPS.CATEGORY_SELECTION });
      
      const categoriesData = await fetchCategories();
      
             addBotMessage(
         "Great! Let's start by selecting the category of equipment you need. What type of project are you working on?",
         categoriesData.map((cat: Category) => ({
           id: cat.id.toString(),
           text: `${cat.name} (${cat.equipment_count} available)`,
           value: cat.id.toString()
         }))
       );
    } else {
      addBotMessage(
        "No problem! Feel free to browse our equipment catalog or contact us if you have any questions. Have a great day! 😊",
        [
          { id: 'browse', text: '🔍 Browse Equipment Catalog', value: 'browse' },
          { id: 'contact', text: '📞 Contact Us', value: 'contact' }
        ]
      );
    }
  };

  const handleCategorySelection = async (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);
    setChatState({ 
      step: CONVERSATION_STEPS.EQUIPMENT_GRID, 
      selectedCategory 
    });
    
    console.log('Selected category:', selectedCategory);
    console.log('All equipment:', allEquipment);
    
    // If allEquipment is empty, fetch it now
    if (allEquipment.length === 0) {
      await fetchAllEquipment();
    }
    
    // Filter equipment by category
    const filteredEquipment = allEquipment.filter((eq: Equipment) => {
      console.log(`Comparing: ${eq.category_name} === ${selectedCategory?.name}`);
      return eq.category_name === selectedCategory?.name;
    });
    
    console.log('Filtered equipment:', filteredEquipment);
    setEquipmentList(filteredEquipment);

    if (filteredEquipment.length > 0) {
      addBotMessage(
        `Here are all available equipment in the ${selectedCategory?.name} category. Please select one to continue:`,
        [],
        filteredEquipment
      );
    } else {
      // Try to fetch equipment directly for this category
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const response = await fetch(`${apiBaseUrl}/equipments/equipment/?category=${selectedCategory?.id}`);
        
        if (response.ok) {
          const data = await response.json();
          const categoryEquipment = data.results || data;
          
          // Process images
          const processedEquipment = categoryEquipment.map((eq: Equipment) => {
            if (eq.image && !eq.image.startsWith('http')) {
              eq.image = `${apiBaseUrl}${eq.image}`;
            }
            return eq;
          });
          
          console.log('Category equipment from API:', processedEquipment);
          
          if (processedEquipment.length > 0) {
            setEquipmentList(processedEquipment);
            addBotMessage(
              `Here are all available equipment in the ${selectedCategory?.name} category. Please select one to continue:`,
              [],
              processedEquipment
            );
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch category equipment:', error);
      }
      
      // If we get here, no equipment was found
      addBotMessage(
        `Sorry, there is no equipment available in the ${selectedCategory?.name} category. Please try another category or contact our team for help.`,
        [
          { id: 'restart', text: '🔄 Start Over', value: 'restart' },
          { id: 'contact', text: '📞 Contact Our Team', value: 'contact' }
        ]
      );
    }
  };

  const handleEquipmentSelection = async (equipmentName: string) => {
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.EQUIPMENT_GRID,
      selectedEquipmentName: equipmentName 
    });
    
    // Filter equipment by selected name
    const matchingEquipment = equipmentList.filter(eq => eq.name === equipmentName);
    
    addBotMessage(
      `Great choice! Here are all available ${equipmentName} units. You can view the full rental catalog by clicking "View All" or select one to continue:`,
      [
        { id: 'view_all', text: '👁️ View All in Rental Catalog', value: 'view_all' }
      ],
      matchingEquipment
    );
  };

  const handleEquipmentGridSelection = (equipment: Equipment) => {
    console.log('Selected equipment:', equipment);
    
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.START_DATE,
      selectedEquipment: equipment 
    });
    
    addUserMessage(`Selected: ${equipment.name}`);
    
    // Show equipment details
    const detailsText = `
Excellent! You've selected ${equipment.name}.

📝 Details:
• Daily Rate: LKR ${equipment.pricing.daily_rate}
${equipment.pricing.weekly_rate ? `• Weekly Rate: LKR ${equipment.pricing.weekly_rate}` : ''}
${equipment.pricing.monthly_rate ? `• Monthly Rate: LKR ${equipment.pricing.monthly_rate}` : ''}
${equipment.specifications?.operating_weight ? `• Weight: ${equipment.specifications.operating_weight}` : ''}
${equipment.specifications?.engine_power ? `• Power: ${equipment.specifications.engine_power}` : ''}

Now, when would you like to start your rental? Please select your start date:`;

    addBotMessage(
      detailsText,
      [],
      undefined,
      true // showCalendar
    );
  };

  const handleDateSelection = (date: string) => {
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.RENTAL_DURATION,
      startDate: date 
    });
    
    addUserMessage(`Start Date: ${date}`);
    
    addBotMessage(
      "Perfect! How many days would you like to rent this equipment?",
      [
        { id: '1', text: '1 day', value: '1' },
        { id: '3', text: '3 days', value: '3' },
        { id: '7', text: '7 days', value: '7' },
        { id: '14', text: '14 days', value: '14' },
        { id: '30', text: '30 days', value: '30' },
        { id: 'custom', text: 'Custom duration', value: 'custom' }
      ]
    );
  };
  
  const handleRentalDuration = (days: string) => {
    if (days === 'custom') {
      addBotMessage(
        "Please enter the number of days you'd like to rent:",
        [],
        undefined,
        false,
        false,
        undefined,
        true // Show custom duration input
      );
      return;
    }
    
    const rentalDays = parseInt(days);
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.AVAILABILITY_CHECK,
      rentalDays
    });
    
    addUserMessage(`Rental Duration: ${rentalDays} days`);
    
    checkEquipmentAvailability(rentalDays);
  };
  
  const handleCustomDurationSubmit = (days: number) => {
    if (isNaN(days) || days < 1) {
      addBotMessage(
        "Please enter a valid number of days (minimum 1).",
        [
          { id: 'retry', text: 'Try Again', value: 'custom' }
        ]
      );
      return;
    }
    
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.AVAILABILITY_CHECK,
      rentalDays: days
    });
    
    addUserMessage(`Rental Duration: ${days} days`);
    
    checkEquipmentAvailability(days);
  };

  const checkEquipmentAvailability = async (days: number) => {
    if (!chatState.selectedEquipment || !chatState.startDate) {
      console.error('Missing equipment or start date');
      return;
    }
    
    setLoading(true);
    
    try {
      // Calculate end date based on start date and rental days
      const startDate = new Date(chatState.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + days - 1); // -1 because rental period includes the start date
      const endDateString = endDate.toISOString().split('T')[0];
      
      const isAvailable = await checkAvailability(
        chatState.selectedEquipment.id,
        chatState.startDate,
        endDateString
      );
      
      if (isAvailable) {
        // Update state first
        const newChatState = { 
          ...chatState, 
          step: CONVERSATION_STEPS.PRICING_OPTIONS,
          rentalDays: days
        };
        setChatState(newChatState);
        
        // Then show pricing options with the updated state
        setTimeout(() => {
          showPricingOptionsWithState(newChatState);
        }, 100);
      } else {
        addBotMessage(
          "Sorry, this equipment is not available for your selected dates. Please choose different dates or contact our team for alternative options.",
          [
            { id: 'change_dates', text: '📅 Choose Different Dates', value: 'change_dates' },
            { id: 'contact', text: '📞 Contact Our Team', value: 'contact' },
            { id: 'restart', text: '🔄 Start Over', value: 'restart' }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      addBotMessage(
        "There was an error checking availability. Let's proceed with pricing options.",
        []
      );
      
      const newChatState = { 
        ...chatState, 
        step: CONVERSATION_STEPS.PRICING_OPTIONS,
        rentalDays: days
      };
      setChatState(newChatState);
      
      setTimeout(() => {
        showPricingOptionsWithState(newChatState);
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const showPricingOptionsWithState = (state: ChatState) => {
    if (!state.selectedEquipment || !state.startDate || !state.rentalDays) {
      console.error('Missing required data for pricing options');
      return;
    }
    
    const startDate = new Date(state.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + state.rentalDays - 1); // -1 because rental period includes the start date
    const endDateString = endDate.toISOString().split('T')[0];
    const duration = state.rentalDays;
    
    const equipment = state.selectedEquipment;
    const dailyCost = equipment.pricing.daily_rate * duration;
    const weeklyCost = equipment.pricing.weekly_rate ? equipment.pricing.weekly_rate * Math.ceil(duration / 7) : dailyCost;
    const monthlyCost = equipment.pricing.monthly_rate ? equipment.pricing.monthly_rate * Math.ceil(duration / 30) : dailyCost;
    
    const pricingData: PricingData = {
      equipment,
      startDate: state.startDate,
      endDate: endDateString,
      duration,
      dailyCost,
      weeklyCost,
      monthlyCost,
      totalAmount: Math.min(dailyCost, weeklyCost, monthlyCost),
      depositAmount: Math.min(dailyCost, weeklyCost, monthlyCost) * 0.5
    };
    
    addBotMessage(
      `Great! Your ${equipment.name} is available from ${state.startDate} to ${endDateString} (${duration} days). Here are your pricing options:`,
      [
        { id: 'daily', text: `💰 Daily Rate: LKR ${dailyCost} total`, value: 'daily' },
        { id: 'weekly', text: `💰 Weekly Rate: LKR ${weeklyCost} total`, value: 'weekly' },
        { id: 'monthly', text: `💰 Monthly Rate: LKR ${monthlyCost} total`, value: 'monthly' }
      ],
      undefined,
      false,
      true, // showPricing
      pricingData
    );
  };

  const handlePricingSelection = (pricingType: string) => {
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.BOOKING_CONFIRMATION,
      selectedPricing: pricingType as 'daily' | 'weekly' | 'monthly'
    });
    
    const message = messages[messages.length - 1];
    const pricingData = message.pricingData;
    
    if (pricingData) {
      let selectedAmount = 0;
      switch (pricingType) {
        case 'daily':
          selectedAmount = pricingData.dailyCost;
          break;
        case 'weekly':
          selectedAmount = pricingData.weeklyCost;
          break;
        case 'monthly':
          selectedAmount = pricingData.monthlyCost;
          break;
      }
      
      const depositAmount = selectedAmount * 0.5;
      
      addBotMessage(
        `Perfect! You've selected the ${pricingType} rate for LKR ${selectedAmount}. 

📋 Rental Summary:
• Equipment: ${pricingData.equipment.name}
• Duration: ${pricingData.duration} days (${pricingData.startDate} to ${pricingData.endDate})
• Total Amount: LKR ${selectedAmount}
• Required Deposit: LKR ${depositAmount} (50%)

The remaining amount will be due after admin approval. Would you like to proceed with booking?`,
        [
          { id: 'book_now', text: '✅ Book Now', value: 'book_now' },
          { id: 'change_pricing', text: '💰 Change Pricing Option', value: 'change_pricing' },
          { id: 'restart', text: '🔄 Start Over', value: 'restart' }
        ]
      );
    }
  };

  const handleBookNow = () => {
    if (!chatState.selectedEquipment || !chatState.startDate || !chatState.rentalDays) return;
    
    // Check if user is authenticated
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (!token) {
      // User is not logged in, show login message
      setChatState({
        ...chatState,
        step: CONVERSATION_STEPS.AUTH_CHECK
      });
      
      addBotMessage(
        "You need to be logged in to complete your booking. Would you like to log in now?",
        [
          { id: 'login', text: '🔑 Log in / Register', value: 'login' },
          { id: 'restart', text: '🔄 Start Over', value: 'restart' }
        ]
      );
      return;
    }
    
    // Calculate end date from start date and rental days
    const startDate = new Date(chatState.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + chatState.rentalDays - 1);
    const endDateString = endDate.toISOString().split('T')[0];
    
    // Navigate to booking page with pre-filled data
    const bookingData = {
      equipmentId: chatState.selectedEquipment.id,
      startDate: chatState.startDate,
      endDate: endDateString,
      duration: chatState.rentalDays,
      pricingType: chatState.selectedPricing
    };
    
    // Store booking data in sessionStorage for the booking page
    sessionStorage.setItem('chatbotBookingData', JSON.stringify(bookingData));
    
    router.push(`/equipments/${chatState.selectedEquipment.id}/rent`);
    setIsOpen(false);
  };

  const restartConversation = () => {
    setMessages([]);
    setChatState({ step: CONVERSATION_STEPS.WELCOME });
    setCategories([]);
    setEquipmentList([]);
    setAllEquipment([]);
    initializeChatbot();
  };

  const handleViewAll = () => {
    router.push('/equipments');
    // Keep chatbot open and maintain state
  };

  const handleChangeDates = () => {
    if (!chatState.selectedEquipment) return;
    
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.START_DATE,
      startDate: undefined,
      rentalDays: undefined
    });
    
    addBotMessage(
      `Let's select new dates for ${chatState.selectedEquipment.name}. Please select your start date:`,
      [],
      undefined,
      true // showCalendar
    );
  };

  const handleChangePricing = () => {
    if (!chatState.selectedEquipment || !chatState.startDate || !chatState.rentalDays) return;
    
    showPricingOptionsWithState(chatState);
  };

  return (
    <>
      {/* Chat Bot Button with Pop-up Animation */}
      <div className="fixed bottom-5 right-8 z-70">
        {/* Pop-up Message */}
        <AnimatePresence>
          {showPopUp && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-16 right-0 bg-white border-[#1b4965] rounded-lg shadow-lg p-3 mb-2 w-31"
            >
              <div className="text-sm text-gray-800 font-medium">
                Can I help you?
              </div>
              {/* Arrow pointing down */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Bot Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ 
            scale: showPopUp ? 1.2 : 1,
            rotate: showPopUp ? [0, -10, 10, -10, 0] : 0
          }}
          transition={{ 
            scale: { duration: 0.3 },
            rotate: { duration: 0.5, repeat: showPopUp ? 2 : 0 }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true);
            setShowPopUp(false);
          }}
          className="w-14 h-14 bg-[#1b4965] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RiCustomerService2Fill className="text-white text-2xl" />
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-8 z-70 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1b4965] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RiCustomerService2Fill className="text-white text-2xl" />
                <div>
                  <h3 className="text-white font-semibold">Equipment Rental Assistant</h3>
                  <p className="text-blue-100 text-xs">Step-by-step booking guide</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 p-2 rounded-full"
              >
                <RiCloseLine className="text-xl" />
              </motion.button>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] ${message.isBot ? 'mr-4' : 'ml-4'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-2xl ${
                        message.isBot
                          ? 'bg-white text-slate-800 shadow-sm border'
                          : 'bg-[#1b4965] text-white'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>

                    {/* Options */}
                    {message.options && (
                      <div className="mt-3 space-y-2">
                        {message.options.map((option) => (
                          <motion.button
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (option.value === 'view_all') {
                                handleViewAll();
                              } else {
                                handleOptionClick(option);
                              }
                            }}
                            className="block w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-[#1b4965] hover:bg-blue-50 transition-all duration-200 text-sm"
                          >
                            {option.text}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Equipment Grid */}
                    {message.equipmentGrid && (
                      <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                        {message.equipmentGrid.map((equipment) => (
                          <motion.div
                            key={equipment.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleEquipmentGridSelection(equipment)}
                            className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:border-[#1b4965] hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={equipment.image || '/assets/images/cmixer.jpg'}
                                  alt={equipment.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 text-sm truncate">
                                  {equipment.name}
                                </h4>
                                <p className="text-xs text-slate-500 mb-1">{equipment.category_name}</p>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="flex items-center gap-1 text-green-600">
                                    <RiMoneyDollarCircleLine className="w-3 h-3" />
                                    LKR ${equipment.pricing.daily_rate}/day
                                  </span>
                                  {equipment.is_available && (
                                    <span className="text-green-600">• Available</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Calendar */}
                    {message.showCalendar && (
                      <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="text-center">
                          <RiCalendarLine className="w-8 h-8 text-[#1b4965] mx-auto mb-2" />
                          <p className="text-sm text-slate-600 mb-3">Select your date</p>
                                                     <input
                             type="date"
                             min={new Date().toISOString().split('T')[0]}
                             onChange={(e) => handleDateSelection(e.target.value)}
                             className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                             aria-label="Select rental date"
                             title="Select rental date"
                           />
                        </div>
                      </div>
                    )}
                    
                    {/* Custom Duration Input */}
                    {message.showDurationInput && (
                      <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="text-center">
                          <RiCalendarLine className="w-8 h-8 text-[#1b4965] mx-auto mb-2" />
                          <p className="text-sm text-slate-600 mb-3">Enter rental duration</p>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const input = e.currentTarget.elements.namedItem('duration') as HTMLInputElement;
                              handleCustomDurationSubmit(parseInt(input.value));
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="number"
                              name="duration"
                              min="1"
                              placeholder="Number of days"
                              className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                              required
                            />
                            <button
                              type="submit"
                              className="bg-[#1b4965] text-white p-2 rounded-lg hover:bg-[#0d3b59] transition-colors"
                            >
                              Submit
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-3 rounded-2xl shadow-sm border">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#1b4965] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#1b4965] rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-[#1b4965] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                      <span className="text-xs text-slate-500">Loading...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="text-center">
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 