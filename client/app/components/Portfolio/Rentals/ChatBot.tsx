'use client';

import { useState, useEffect } from 'react';
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
  };
  is_available: boolean;
  availability_status: string;
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
  endDate?: string;
  selectedPricing?: 'daily' | 'weekly' | 'monthly';
}

const CONVERSATION_STEPS = {
  WELCOME: 'welcome',
  CATEGORY_SELECTION: 'category_selection',
  EQUIPMENT_SELECTION: 'equipment_selection',
  EQUIPMENT_GRID: 'equipment_grid',
  START_DATE: 'start_date',
  END_DATE: 'end_date',
  AVAILABILITY_CHECK: 'availability_check',
  PRICING_OPTIONS: 'pricing_options',
  BOOKING_CONFIRMATION: 'booking_confirmation'
};

export default function ChatBotRentalsPortfolio() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatState, setChatState] = useState<ChatState>({ step: CONVERSATION_STEPS.WELCOME });
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize chatbot
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChatbot();
    }
  }, [isOpen]);

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

  const initializeChatbot = () => {
    addBotMessage(
      "Hello! I'm your equipment rental assistant. I'll help you find the perfect equipment for your project in just a few questions. How can I help you today?",
      [
        { id: 'rent', text: '🔧 I want to rent equipment', value: 'rent' },
        { id: 'info', text: 'ℹ️ Just browsing for information', value: 'info' }
      ]
    );
  };

  const generateUniqueId = () => {
    return Date.now() + Math.random() * 1000;
  };

  const addBotMessage = (text: string, options?: Option[], equipmentGrid?: Equipment[], showCalendar?: boolean, showPricing?: boolean, pricingData?: PricingData) => {
    const message: Message = {
      id: generateUniqueId(),
      text,
      isBot: true,
      timestamp: new Date(),
      options,
      equipmentGrid,
      showCalendar,
      showPricing,
      pricingData
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: generateUniqueId(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/equipments/categories/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
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

  const fetchEquipmentByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/equipments/equipments/?category=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setEquipmentList(data.results || data);
        return data.results || data;
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
    
    // Fallback equipment
    // const fallbackEquipment = [
    //   {
    //     id: '1',
    //     name: 'Excavator CAT 320D',
    //     description: 'Heavy-duty excavator',
    //     category_name: 'Construction Equipment',
    //     image: '/assets/images/cmixer.jpg',
    //     pricing: { daily_rate: 500, weekly_rate: 3000, monthly_rate: 10000 },
    //     is_available: true,
    //     availability_status: 'AVAILABLE'
    //   },
    //   {
    //     id: '2',
    //     name: 'Concrete Mixer',
    //     description: 'Professional concrete mixer',
    //     category_name: 'Construction Equipment',
    //     image: '/assets/images/cmixer.jpg',
    //     pricing: { daily_rate: 150, weekly_rate: 900, monthly_rate: 3000 },
    //     is_available: true,
    //     availability_status: 'AVAILABLE'
    //   }
    // ];
    // setEquipmentList(fallbackEquipment);
    // return fallbackEquipment;
  };

  const checkAvailability = async (equipmentId: string, startDate: string, endDate: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/equipments/equipments/${equipmentId}/bookings/`);
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
      case CONVERSATION_STEPS.PRICING_OPTIONS:
        await handlePricingSelection(option.value);
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
      step: CONVERSATION_STEPS.EQUIPMENT_SELECTION, 
      selectedCategory 
    });
    
    const equipmentData = await fetchEquipmentByCategory(parseInt(categoryId));
    
         // Get unique equipment names
     const uniqueEquipmentNames = [...new Set(equipmentData.map((eq: Equipment) => eq.name))] as string[];
     
     addBotMessage(
       `Perfect! You selected ${selectedCategory?.name}. Now, which specific equipment do you need?`,
       uniqueEquipmentNames.map((name: string) => ({
         id: name.replace(/\s+/g, '_').toLowerCase(),
         text: name,
         value: name
       }))
     );
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
    setChatState({ 
      ...chatState, 
      step: CONVERSATION_STEPS.START_DATE,
      selectedEquipment: equipment 
    });
    
    addUserMessage(`Selected: ${equipment.name}`);
    
    addBotMessage(
      `Excellent! You've selected ${equipment.name}. Now, when would you like to start your rental? Please select your start date:`,
      [],
      undefined,
      true // showCalendar
    );
  };

  const handleDateSelection = (date: string, isStartDate: boolean) => {
    if (isStartDate) {
      setChatState({ 
        ...chatState, 
        step: CONVERSATION_STEPS.END_DATE,
        startDate: date 
      });
      
      addUserMessage(`Start Date: ${date}`);
      
      addBotMessage(
        "Perfect! Now please select your end date:",
        [],
        undefined,
        true // showCalendar
      );
    } else {
      setChatState({ 
        ...chatState, 
        step: CONVERSATION_STEPS.AVAILABILITY_CHECK,
        endDate: date 
      });
      
      addUserMessage(`End Date: ${date}`);
      
      checkEquipmentAvailability(date);
    }
  };

  const checkEquipmentAvailability = async (endDate: string) => {
    if (!chatState.selectedEquipment || !chatState.startDate) {
      console.error('Missing equipment or start date');
      return;
    }
    
    setLoading(true);
    
    try {
      const isAvailable = await checkAvailability(
        chatState.selectedEquipment.id,
        chatState.startDate,
        endDate
      );
      
      if (isAvailable) {
        // Update state first
        const newChatState = { 
          ...chatState, 
          step: CONVERSATION_STEPS.PRICING_OPTIONS,
          endDate 
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
        endDate 
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
    if (!state.selectedEquipment || !state.startDate || !state.endDate) {
      console.error('Missing required data for pricing options');
      return;
    }
    
    const startDate = new Date(state.startDate);
    const endDate = new Date(state.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const equipment = state.selectedEquipment;
    const dailyCost = equipment.pricing.daily_rate * duration;
    const weeklyCost = equipment.pricing.weekly_rate ? equipment.pricing.weekly_rate * Math.ceil(duration / 7) : dailyCost;
    const monthlyCost = equipment.pricing.monthly_rate ? equipment.pricing.monthly_rate * Math.ceil(duration / 30) : dailyCost;
    
    const pricingData: PricingData = {
      equipment,
      startDate: state.startDate,
      endDate: state.endDate,
      duration,
      dailyCost,
      weeklyCost,
      monthlyCost,
      totalAmount: Math.min(dailyCost, weeklyCost, monthlyCost),
      depositAmount: Math.min(dailyCost, weeklyCost, monthlyCost) * 0.5
    };
    
    addBotMessage(
      `Great! Your ${equipment.name} is available from ${state.startDate} to ${state.endDate} (${duration} days). Here are your pricing options:`,
      [
        { id: 'daily', text: `💰 Daily Rate: $${dailyCost} total`, value: 'daily' },
        { id: 'weekly', text: `💰 Weekly Rate: $${weeklyCost} total`, value: 'weekly' },
        { id: 'monthly', text: `💰 Monthly Rate: $${monthlyCost} total`, value: 'monthly' }
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
        `Perfect! You've selected the ${pricingType} rate for $${selectedAmount}. 

📋 Rental Summary:
• Equipment: ${pricingData.equipment.name}
• Duration: ${pricingData.startDate} to ${pricingData.endDate}
• Total Amount: $${selectedAmount}
• Required Deposit: $${depositAmount} (50%)

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
    if (!chatState.selectedEquipment) return;
    
    // Navigate to booking page with pre-filled data
    const bookingData = {
      equipmentId: chatState.selectedEquipment.id,
      startDate: chatState.startDate,
      endDate: chatState.endDate,
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
      endDate: undefined
    });
    
    addBotMessage(
      `Let's select new dates for ${chatState.selectedEquipment.name}. Please select your start date:`,
      [],
      undefined,
      true // showCalendar
    );
  };

  const handleChangePricing = () => {
    if (!chatState.selectedEquipment || !chatState.startDate || !chatState.endDate) return;
    
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
                                    ${equipment.pricing.daily_rate}/day
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
                             onChange={(e) => handleDateSelection(e.target.value, chatState.step === CONVERSATION_STEPS.START_DATE)}
                             className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                             aria-label="Select rental date"
                             title="Select rental date"
                           />
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
                <p className="text-xs text-slate-500">
                  Step {Object.values(CONVERSATION_STEPS).indexOf(chatState.step) + 1}/9 • Powered by AI
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 