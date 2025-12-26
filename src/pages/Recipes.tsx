import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { 
  ChefHat, Clock, Flame, Package, Search, MapPin, 
  X, List, PlayCircle 
} from "lucide-react";

// --- Types ---
type Recipe = {
  id: string;
  title: string;
  image: string;
  usedIngredient: string;
  missingCount: number;
  time: string;
  calories: number;
  regionKeywords: string[];
  description: string;
  ingredients: string[];
  instructions: string[];
};

// --- MASSIVE RECIPE DATABASE (Covering 28 States) ---
// --- MASSIVE RECIPE DATABASE (Fixed Images) ---
const RECIPE_DATABASE: Recipe[] = [
    // ================= SOUTH INDIA =================
    {
      id: "ap-1",
      title: "Pulihora (Tamarind Rice)",
      image: "https://imgs.search.brave.com/fGXuigU2fEPl5b-TsvoEv3kRdZMUj86m60RN3x30Wug/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/aW5kaWFuaGVhbHRo/eXJlY2lwZXMuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI0/LzA2L3B1bGlob3Jh/LndlYnA",
      usedIngredient: "Rice",
      missingCount: 2,
      time: "20 min",
      calories: 320,
      regionKeywords: ["Andhra Pradesh", "Telangana"],
      description: "Tangy and spicy rice made with tamarind paste and peanuts. A festive staple.",
      ingredients: ["2 cups Cooked Rice", "1 lemon size Tamarind", "1/4 cup Peanuts", "4 Green Chilies", "1 tsp Mustard Seeds", "Curry Leaves", "Turmeric"],
      instructions: ["Soak tamarind and extract thick juice.", "Cook the tamarind extract with jaggery and salt until thick.", "Roast peanuts in oil. Add mustard seeds, chilies, and curry leaves.", "Mix the cooked paste and tempering into the rice gently."]
    },
    {
      id: "ka-1",
      title: "Bisi Bele Bath",
      image: "https://imgs.search.brave.com/U4D5hmml2RmfuDbXAxYeIk_cyH5y4qm4FYgTRAM01N8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/Y2hlZnNwZW5jaWwu/Y29tL3dwLWNvbnRl/bnQvdXBsb2Fkcy9C/aXNlLUJlbGUtQmhh/dGgtNjQweDY0MC5q/cGc",
      usedIngredient: "Toor Dal",
      missingCount: 3,
      time: "40 min",
      calories: 410,
      regionKeywords: ["Karnataka"],
      description: "A spicy, flavorful rice and lentil dish loaded with vegetables.",
      ingredients: ["1 cup Rice", "1/2 cup Toor Dal", "Mixed Veggies", "2 tbsp Bisi Bele Bath Powder", "Tamarind", "Ghee", "Cashews"],
      instructions: ["Pressure cook rice and dal together.", "Boil veggies with tamarind water.", "Add the cooked rice-dal mix to the veggies.", "Stir in the spice powder and salt.", "Temper with mustard seeds and cashews in ghee."]
    },
    {
      id: "kl-1",
      title: "Avial (Mixed Veg Curry)",
      image: "https://rakskitchen.net/wp-content/uploads/2010/04/avial-recipe.jpg",
      usedIngredient: "Coconut",
      missingCount: 1,
      time: "25 min",
      calories: 220,
      regionKeywords: ["Kerala"],
      description: "A thick mixture of vegetables and coconut, seasoned with coconut oil and curry leaves.",
      ingredients: ["Mixed Vegetables (Yam, Drumstick, Carrot)", "1 cup Grated Coconut", "1/2 cup Curd", "Green Chilies", "Coconut Oil", "Curry Leaves"],
      instructions: ["Boil vegetables with turmeric and salt.", "Grind coconut and chilies to a coarse paste.", "Add paste to veggies and cook for 2 mins.", "Remove from heat and stir in curd.", "Drizzle raw coconut oil on top."]
    },
    {
      id: "tn-1",
      title: "Chicken Chettinad",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800",
      usedIngredient: "Chicken",
      missingCount: 4,
      time: "50 min",
      calories: 500,
      regionKeywords: ["Tamil Nadu"],
      description: "A fiery chicken dish from the Chettinad region, famous for its roasted spices.",
      ingredients: ["500g Chicken", "2 tbsp Chettinad Masala", "1 Onion", "2 Tomatoes", "Ginger-Garlic Paste", "Curry Leaves"],
      instructions: ["Roast dry spices (peppercorns, coriander, cumin) and grind.", "Sauté onions, curry leaves, and tomatoes.", "Add chicken and brown it.", "Add the ground masala and water. Simmer until chicken is tender."]
    },
    {
      id: "tg-1",
      title: "Hyderabadi Dal",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800",
      usedIngredient: "Toor Dal",
      missingCount: 2,
      time: "30 min",
      calories: 280,
      regionKeywords: ["Telangana", "Andhra Pradesh"],
      description: "A tangy lentil curry made with tamarind or raw mango.",
      ingredients: ["1 cup Toor Dal", "1 Raw Mango or Tamarind", "4 Green Chilies", "Garlic cloves", "Mustard Seeds", "Curry Leaves"],
      instructions: ["Pressure cook dal with green chilies and raw mango pieces.", "Mash the dal smoothly.", "Adjust consistency with water and salt.", "Temper with mustard seeds, garlic, and red chilies."]
    },
  
    // ================= NORTH INDIA =================
    {
      id: "pb-1",
      title: "Sarson Ka Saag",
      image: "https://maayeka.com/wp-content/uploads/2018/11/Punjabi-sarson-KA-saag-recipe.jpg.webp",
      usedIngredient: "Mustard Greens",
      missingCount: 2,
      time: "45 min",
      calories: 300,
      regionKeywords: ["Punjab", "Haryana"],
      description: "A winter staple made from mustard greens and spices, best eaten with Makki ki Roti.",
      ingredients: ["1 bunch Mustard Greens", "1/2 bunch Spinach", "Ginger", "Garlic", "Green Chilies", "Maize Flour (Makki atta)", "Butter"],
      instructions: ["Boil the greens until soft.", "Blend into a coarse paste.", "Cook the paste with maize flour, ginger, and garlic.", "Finish with a big dollop of white butter."]
    },
    {
      id: "jk-1",
      title: "Rajma Chawal",
      image: "https://eatmoreart.org/wp-content/uploads/2020/05/Rajma-Chawal-Indian-Curried-Kidney-Beans-Rice-IMG_1801-scaled.jpg", // FIXED: Now points to a Dal/Curry bowl, not shoes!
      usedIngredient: "Rajma",
      missingCount: 2,
      time: "60 min",
      calories: 450,
      regionKeywords: ["Jammu and Kashmir", "Himachal Pradesh", "Punjab", "Delhi"],
      description: "Red kidney beans in a thick tomato gravy served with steamed rice.",
      ingredients: ["1 cup Kidney Beans (soaked)", "2 Onions", "3 Tomatoes", "Ginger-Garlic Paste", "Garam Masala", "Coriander"],
      instructions: ["Pressure cook soaked Rajma until soft.", "Make a masala with onions, tomatoes, and spices.", "Add boiled rajma to the masala and simmer.", "Mash a few beans to thicken gravy. Serve with rice."]
    },
    {
      id: "uk-1",
      title: "Aloo Ke Gutke",
      image: "https://www.whiskaffair.com/wp-content/uploads/2022/03/Aloo-ke-Gutke-2-1-1200x1800.jpg",
      usedIngredient: "Potatoes",
      missingCount: 2,
      time: "20 min",
      calories: 260,
      regionKeywords: ["Uttarakhand"],
      description: "Spicy stir-fried potatoes with jambu/cumin, a Pahadi classic.",
      ingredients: ["4 Boiled Potatoes", "Mustard Oil", "Red Chilies", "Coriander Powder", "Turmeric"],
      instructions: ["Cut boiled potatoes into cubes.", "Heat mustard oil. Add dry red chilies and spices.", "Toss potatoes until coated and slightly crispy.", "Garnish with coriander."]
    },
    {
      id: "up-1",
      title: "Tehri (Veg Pulao)",
      image: "https://www.cookwithmanali.com/wp-content/uploads/2023/09/Tehri-Recipe-Veg-Tehri-1200x1818.jpg",
      usedIngredient: "Rice",
      missingCount: 3,
      time: "30 min",
      calories: 350,
      regionKeywords: ["Uttar Pradesh", "Bihar"],
      description: "A yellow rice dish cooked with potatoes, peas, and cauliflower.",
      ingredients: ["1 cup Basmati Rice", "2 Potatoes", "1/2 cup Peas", "Cauliflower", "Turmeric", "Whole Spices"],
      instructions: ["Heat oil in a pot. Add whole spices.", "Sauté veggies and washed rice.", "Add turmeric, salt, and double the water.", "Cover and cook until rice is fluffy."]
    },
  
    // ================= EAST INDIA =================
    {
      id: "br-1",
      title: "Litti Chokha",
      image: "https://www.thinkrightme.com/wp-content/uploads/2022/01/Untitled-design-17.jpg",
      usedIngredient: "Sattu",
      missingCount: 2,
      time: "50 min",
      calories: 400,
      regionKeywords: ["Bihar", "Jharkhand"],
      description: "Wheat balls stuffed with roasted gram flour, served with mashed eggplant.",
      ingredients: ["Wheat Flour", "Sattu", "Brinjal", "Tomato", "Garlic", "Mustard Oil", "Lemon"],
      instructions: ["Make dough balls stuffed with spiced Sattu.", "Roast/Bake until hard.", "Roast brinjal and tomato, mash with spices for Chokha.", "Dip Litti in ghee and serve."]
    },
    {
      id: "wb-1",
      title: "Macher Jhol (Fish Curry)",
      image: "https://peekncooksa.blob.core.windows.net/index-recipe/foli_macher_jhol.jpg", // FIXED: Fish curry image
      usedIngredient: "Fish",
      missingCount: 3,
      time: "40 min",
      calories: 320,
      regionKeywords: ["West Bengal", "Odisha", "Tripura"],
      description: "A light fish stew made with potatoes and cauliflower.",
      ingredients: ["500g Fish", "1 Potato", "1 tsp Panch Phoron", "Mustard Oil", "Turmeric", "Green Chilies"],
      instructions: ["Marinate fish with turmeric and salt. Lightly fry.", "In the same oil, fry potatoes.", "Add spices and water to make a thin gravy.", "Add fish back in and boil for 5 mins."]
    },
    {
      id: "od-1",
      title: "Dalma",
      image: "https://static.wixstatic.com/media/26b5bf_bdf88c75c2064e8cb0411767ea2c709c~mv2.jpg/v1/fill/w_980%2Ch_1263%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/26b5bf_bdf88c75c2064e8cb0411767ea2c709c~mv2.jpg",
      usedIngredient: "Toor Dal",
      missingCount: 3,
      time: "35 min",
      calories: 290,
      regionKeywords: ["Odisha"],
      description: "Nutritious dal cooked with raw papaya, pumpkin, and brinjal.",
      ingredients: ["1 cup Dal", "Raw Papaya", "Pumpkin", "Brinjal", "Panch Phoron", "Coconut"],
      instructions: ["Boil dal with chopped vegetables and turmeric.", "Temper panch phoron and dry chilies in ghee.", "Pour over the dal.", "Garnish with grated coconut."]
    },
  
    // ================= WEST INDIA =================
    {
      id: "gj-1",
      title: "Methi Thepla",
      image: "https://www.masalakorb.com/wp-content/uploads/2020/09/Gujarati-Methi-Thepla-Recipe-V1.jpg",
      usedIngredient: "Wheat Flour",
      missingCount: 1,
      time: "15 min",
      calories: 180,
      regionKeywords: ["Gujarat"],
      description: "Spiced flatbreads made with fresh fenugreek leaves.",
      ingredients: ["Wheat Flour", "Fresh Methi", "Curd", "Sesame Seeds", "Turmeric", "Chili Powder"],
      instructions: ["Mix all ingredients into a dough.", "Roll into thin circles.", "Cook on a tawa with oil until golden spots appear."]
    },
    {
      id: "mh-1",
      title: "Misal Pav",
      image: "https://smithakalluraya.com/wp-content/uploads/2014/05/misal-pav-recipe-1.jpg",
      usedIngredient: "Sprouts",
      missingCount: 3,
      time: "40 min",
      calories: 500,
      regionKeywords: ["Maharashtra"],
      description: "Spicy sprout curry topped with farsan/sev and served with bread.",
      ingredients: ["2 cups Matki Sprouts", "Onion", "Tomato", "Misal Masala", "Farsan", "Pav"],
      instructions: ["Cook sprouts with turmeric.", "Prepare a spicy onion-tomato gravy (kat).", "Mix sprouts into the gravy.", "Top with farsan, chopped onion, and lemon. Serve with Pav."]
    },
    {
      id: "goa-1",
      title: "Goan Fish Curry",
      image: "https://www.recipetineats.com/tachyon/2020/10/Goan-Fish-Curry_6.jpg",
      usedIngredient: "Fish",
      missingCount: 2,
      time: "30 min",
      calories: 380,
      regionKeywords: ["Goa"],
      description: "Tangy and spicy fish curry made with coconut milk and kokum.",
      ingredients: ["500g Fish", "1 cup Coconut Milk", "Kokum", "Red Chilies", "Coriander Seeds"],
      instructions: ["Grind coconut, chilies, and coriander.", "Boil the paste with water.", "Add fish and kokum.", "Simmer for 5-7 minutes. Do not overcook."]
    },
    {
      id: "mp-1",
      title: "Poha Jalebi",
      image: "https://ribbonstopastas.com/wp-content/uploads/2022/03/Indore-Breakfast.jpg",
      usedIngredient: "Poha",
      missingCount: 2,
      time: "15 min",
      calories: 300,
      regionKeywords: ["Madhya Pradesh", "Chhattisgarh"],
      description: "Steamed flattened rice with mild spices, fennel, and pomegranate.",
      ingredients: ["2 cups Thick Poha", "1 Onion", "Fennel Seeds (Saunf)", "Turmeric", "Sev", "Peanuts"],
      instructions: ["Rinse poha and let it soften.", "Sauté onions, peanuts, and fennel seeds.", "Add turmeric and poha. Steam covered for 2 mins.", "Garnish with sev and pomegranate."]
    },
  
    // ================= NORTH EAST INDIA =================
    {
      id: "as-1",
      title: "Masor Tenga",
      image: "https://experiencesofagastronomad.com/masor-bilahi-tenga/masor-bilahi-tenga1",
      usedIngredient: "Fish",
      missingCount: 2,
      time: "25 min",
      calories: 250,
      regionKeywords: ["Assam"],
      description: "A light and sour fish curry made with tomatoes and elephant apple (ou tenga).",
      ingredients: ["Rohu Fish", "2 Tomatoes", "Lemon Juice or Ou Tenga", "Mustard Seeds", "Turmeric"],
      instructions: ["Lightly fry the fish.", "Sauté tomatoes until soft.", "Add water and souring agent (lemon/ou tenga).", "Add fish and boil for 5-6 minutes."]
    },
    {
      id: "sk-1",
      title: "Chicken Thukpa",
      image: "https://oventales.com/wp-content/uploads/2018/11/Chicken-Thukpa005.jpg",
      usedIngredient: "Noodles",
      missingCount: 3,
      time: "30 min",
      calories: 350,
      regionKeywords: ["Sikkim", "Arunachal Pradesh", "Ladakh"],
      description: "A hearty Himalayan noodle soup with vegetables and meat.",
      ingredients: ["Egg Noodles", "Chicken Breast", "Carrot", "Cabbage", "Garlic", "Soy Sauce"],
      instructions: ["Boil chicken to make broth.", "Sauté garlic and veggies.", "Add broth and soy sauce.", "Add noodles and cooked chicken. Simmer for 5 mins."]
    },
    {
      id: "ng-1",
      title: "Smoked Pork with Bamboo Shoot",
      image: "https://i0.wp.com/atmykitchen.net/wp-content/uploads/2018/02/img_20160811141145_save_wm.jpg?resize=648%2C864&ssl=1", 
      usedIngredient: "Pork",
      missingCount: 2,
      time: "50 min",
      calories: 500,
      regionKeywords: ["Nagaland", "Manipur", "Meghalaya", "Mizoram"],
      description: "The signature dish of Nagaland, using dry smoked pork and fermented bamboo.",
      ingredients: ["500g Smoked Pork", "1/2 cup Fermented Bamboo Shoot", "Raja Mircha (Ghost Pepper)", "Ginger-Garlic"],
      instructions: ["Wash smoked pork thoroughly.", "Cook with bamboo shoots, crushed ginger, garlic, and chilies.", "Add water and boil until pork is tender and gravy is dry.", "No oil is usually needed."]
    },
    {
      id: "mn-1",
      title: "Eromba",
      image: "https://foodiestreasure.com/wp-content/uploads/2019/08/20190815_160147.jpg?h=925&w=568",
      usedIngredient: "Vegetables",
      missingCount: 2,
      time: "20 min",
      calories: 150,
      regionKeywords: ["Manipur"],
      description: "A spicy chutney made with boiled vegetables and fermented fish.",
      ingredients: ["Boiled Potato", "Bamboo Shoot", "Fermented Fish (Ngari)", "King Chili"],
      instructions: ["Boil the vegetables.", "Roast the fermented fish.", "Mash everything together with fresh chilies and coriander."]
    },
    {
      id: "xy-3",
      title: "Kanji (Traditional Rice Gruel)",
      image: "https://sc0.blr1.cdn.digitaloceanspaces.com/article/146900-dtpubvyxcr-1599047894.jpg",
      usedIngredient: "Kerala matta rice",
      missingCount: 2,
      time: "20 min",
      calories: 170,
      regionKeywords: ["Tamil nadu"],
      "description": "A light, nourishing rice porridge traditionally eaten for easy digestion and gut health.",
  "ingredients": ["Kerala matta rice", "Water", "Salt"],
  "instructions": [
    "Wash the rice thoroughly.",
    "Cook the rice with plenty of water until very soft.",
    "Add salt and serve warm as a gruel."]
    },
    {
    "id": "xy-4",
    "title": "Olan (Ancient Coconut Milk Curry)",
    "image": "https://www.kannammacooks.com/wp-content/uploads/olan-recipe-with-coconut-milk-recipe-kerala-pumpkin-ash-gourd-1-2.jpg",
    "usedIngredient": "Ash gourd",
    "missingCount": 4,
    "time": "30 min",
    "calories": 210,
    "regionKeywords": ["Kerala"],
    "description": "A mild Kerala curry made with ash gourd and cowpeas simmered in coconut milk.",
    "ingredients": ["Ash gourd", "Cowpeas", "Coconut milk", "Green chilies", "Curry leaves", "Coconut oil", "Salt"],
    "instructions": [
      "Cook ash gourd and cowpeas with green chilies and salt.",
      "Add thin coconut milk and simmer gently.",
      "Finish with thick coconut milk, curry leaves, and coconut oil."
    ]
  },
  {
    "id": "xy-5",
    "title": "Kalan (Ancient Yogurt Curry)",
    "image": "https://rakskitchen.net/wp-content/uploads/2024/07/raw-banana-kalan.jpg",
    "usedIngredient": "Curd",
    "missingCount": 5,
    "time": "35 min",
    "calories": 260,
    "regionKeywords": ["Kerala"],
    "description": "A thick, tangy yogurt-based curry prepared with raw banana and yam.",
    "ingredients": ["Raw banana", "Yam", "Curd", "Grated coconut", "Green chilies", "Cumin seeds", "Coconut oil", "Salt"],
    "instructions": [
      "Cook banana and yam with turmeric and salt.",
      "Grind coconut, cumin, and green chilies into a paste.",
      "Add paste and curd, cook gently.",
      "Temper with coconut oil and curry leaves."
    ]
  },
  {
    "id": "xy-6",
    "title": "Avial (Ancient Mixed Vegetable Dish)",
    "image": "https://imgs.search.brave.com/WhdewtXURhPuItJ7OVcvejyDo_aeEe8Ot_Uf-ZMoTk4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jb29r/Mm5vdXJpc2guY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDEz/LzEwL2Z1bGxzaXpl/b3V0cHV0XzE4NjEt/MS03NTB4NTAwLmpw/ZWc",
    "usedIngredient": "Mixed vegetables",
    "missingCount": 6,
    "time": "30 min",
    "calories": 240,
    "regionKeywords": ["Kerala", "Tamil Nadu"],
    "description": "A wholesome dish of mixed vegetables cooked with coconut and yogurt.",
    "ingredients": ["Mixed vegetables", "Grated coconut", "Green chilies", "Cumin seeds", "Curd", "Coconut oil", "Salt"],
    "instructions": [
      "Cook vegetables with salt until tender.",
      "Grind coconut, cumin, and green chilies.",
      "Mix paste and curd with vegetables.",
      "Finish with coconut oil and curry leaves."
    ]
  },

  {
    "id": "xy-7",
    "title": "Thoran (Stir-Fried Vegetables with Coconut)",
    "image": "https://thefamiliarkitchen.com/wp-content/uploads/2019/02/4-IMG_5364-scaled.jpg",
    "usedIngredient": "Grated coconut",
    "missingCount": 4,
    "time": "20 min",
    "calories": 180,
    "regionKeywords": ["Kerala"],
    "description": "A dry vegetable stir-fry tossed with coconut and mild spices.",
    "ingredients": ["Chopped vegetables", "Grated coconut", "Mustard seeds", "Green chilies", "Coconut oil", "Salt"],
    "instructions": [
      "Lightly cook vegetables with salt.",
      "Temper mustard seeds and chilies in coconut oil.",
      "Add vegetables and coconut, stir well."
    ]
  },

  {
    "id": "xy-8",
    "title": "Pachadi (Ancient Sweet-Sour Yogurt Dish)",
    "image": "https://somethingiscooking.com/wp-content/uploads/2021/09/Carrot-Pachadi-featured.jpg",
    "usedIngredient": "Curd",
    "missingCount": 4,
    "time": "25 min",
    "calories": 220,
    "regionKeywords": ["Kerala"],
    "description": "A refreshing yogurt-based dish with sweet and tangy flavors.",
    "ingredients": ["Fruit/vegetable", "Curd", "Grated coconut", "Mustard seeds", "Green chilies", "Coconut oil", "Salt"],
    "instructions": [
      "Cook fruit or vegetable until soft.",
      "Grind coconut, mustard, and chilies.",
      "Mix paste and curd with cooked base.",
      "Temper with coconut oil and curry leaves."
    ]
  },

  {
    "id": "xy-9",
    "title": "Kootu Curry (Ancient Legume-Vegetable Dish)",
    "image": "https://thephotowali.wordpress.com/wp-content/uploads/2023/07/wp-16907836839621802323548805122233.jpg",
    "usedIngredient": "Black chickpeas",
    "missingCount": 5,
    "time": "40 min",
    "calories": 290,
    "regionKeywords": ["Kerala"],
    "description": "A semi-dry curry made with legumes, vegetables, and coconut.",
    "ingredients": ["Black chickpeas", "Raw banana", "Yam", "Grated coconut", "Cumin seeds", "Pepper", "Coconut oil", "Salt"],
    "instructions": [
      "Cook chickpeas and vegetables until soft.",
      "Grind coconut, cumin, and pepper.",
      "Mix with vegetables.",
      "Temper with coconut oil and curry leaves."
    ]
  },

  {
    "id": "xy-10",
    "title": "Payasam (Ancient Sweet Dish)",
    "image": "https://images.getrecipekit.com/20231006064107-kerala-20special-20payasam.jpg?aspect_ratio=4%3A3&quality=90",
    "usedIngredient": "Rice / Ada",
    "missingCount": 4,
    "time": "45 min",
    "calories": 360,
    "regionKeywords": ["Kerala"],
    "description": "A traditional dessert prepared by slow-cooking rice with milk or coconut milk.",
    "ingredients": ["Rice or rice ada", "Jaggery or sugar", "Milk or coconut milk", "Ghee", "Cashews", "Cardamom"],
    "instructions": [
      "Cook rice or ada until soft.",
      "Add jaggery or sugar and simmer.",
      "Add milk or coconut milk.",
      "Finish with ghee-roasted nuts and cardamom."
    ]
  },
  {
    "id": "tm-1",
    "title": "Thinai Pongal (Foxtail Millet Pongal)",
    "image": "https://pipingpotcurry.com/wp-content/uploads/2022/04/Thinai-Pongal.-Foxtail-Millet-Recipe-Piping-Pot-Curry.jpg",
    "usedIngredient": "Foxtail millet",
    "missingCount": 4,
    "time": "25 min",
    "calories": 260,
    "regionKeywords": ["Tamil Nadu"],
    "description": "A healthy ancient pongal made with foxtail millet and lentils for sustained energy.",
    "ingredients": ["Foxtail millet", "Moong dal", "Black pepper", "Cumin seeds", "Ghee", "Salt"],
    "instructions": [
      "Wash millet and dal thoroughly.",
      "Pressure cook with water until soft.",
      "Temper with ghee, pepper, and cumin.",
      "Mix well and serve hot."
    ]
  },

  {
    "id": "tm-2",
    "title": "Kambu Kanji (Pearl Millet Porridge)",
    "image": "https://myhealthykiddo.com/wp-content/uploads/2017/05/Pearl-Millet-Porridge-Recipe-1.jpg",
    "usedIngredient": "Pearl millet",
    "missingCount": 2,
    "time": "20 min",
    "calories": 180,
    "regionKeywords": ["Tamil Nadu"],
    "description": "A cooling and nourishing fermented porridge made from pearl millet.",
    "ingredients": ["Pearl millet flour", "Water", "Salt"],
    "instructions": [
      "Mix millet flour with water.",
      "Cook on low flame until thick.",
      "Cool, ferment lightly, add salt, and serve."
    ]
  },

  {
    "id": "tm-3",
    "title": "Kezhvaragu Kali (Ragi Ball)",
    "image": "https://www.sharmispassions.com/wp-content/uploads/2019/06/ragi-mudde5.jpg",
    "usedIngredient": "Ragi flour",
    "missingCount": 1,
    "time": "15 min",
    "calories": 220,
    "regionKeywords": ["Tamil Nadu"],
    "description": "A calcium-rich ragi ball traditionally eaten with spicy gravies.",
    "ingredients": ["Ragi flour", "Water", "Salt"],
    "instructions": [
      "Boil water with salt.",
      "Add ragi flour slowly while stirring.",
      "Cook until thick and shape into balls."
    ]
  },

  {
    "id": "tm-4",
    "title": "Samai Sadham (Little Millet Rice)",
    "image": "https://simpleindianrecipes.com/portals/0/sirimages/Little-Millet-Rice-Samai-Sadam-M2.jpg",
    "usedIngredient": "Little millet",
    "missingCount": 1,
    "time": "20 min",
    "calories": 210,
    "regionKeywords": ["Tamil Nadu"],
    "description": "A light and nutritious rice substitute made with little millet.",
    "ingredients": ["Little millet", "Water", "Salt"],
    "instructions": [
      "Wash and soak millet briefly.",
      "Cook with water until fluffy.",
      "Add salt and serve as rice."
    ]
  },

  {
    "id": "tm-5",
    "title": "Aviyal (Traditional Mixed Vegetable Dish)",
    "image": "https://i0.wp.com/www.pepperdelight.com/wp-content/uploads/2016/04/pepper-delight-aviyal-4.jpg?fit=1999%2C2999&ssl=1",
    "usedIngredient": "Mixed vegetables",
    "missingCount": 5,
    "time": "30 min",
    "calories": 240,
    "regionKeywords": ["Tamil Nadu", "Kerala"],
    "description": "A traditional mixed vegetable dish cooked with coconut and yogurt.",
    "ingredients": ["Mixed vegetables", "Grated coconut", "Green chilies", "Cumin seeds", "Curd", "Coconut oil", "Salt"],
    "instructions": [
      "Cook vegetables with salt.",
      "Grind coconut, cumin, and chilies.",
      "Mix paste and curd into vegetables.",
      "Finish with coconut oil."
    ]
  },

  {
    "id": "tm-6",
    "title": "Keerai Masiyal (Mashed Greens)",
    "image": "https://www.vidhyashomecooking.com/wp-content/uploads/2025/04/SpinachMash.jpg",
    "usedIngredient": "Spinach/Greens",
    "missingCount": 3,
    "time": "15 min",
    "calories": 120,
    "regionKeywords": ["Tamil Nadu"],
    "description": "A simple mashed greens dish rich in iron and fiber.",
    "ingredients": ["Greens (spinach/amaranth)", "Garlic", "Cumin seeds", "Oil", "Salt"],
    "instructions": [
      "Cook greens until soft.",
      "Mash well and add salt.",
      "Temper garlic and cumin, mix and serve."
    ]
  },

  {
    "id": "tm-7",
    "title": "Payaru Sadham (Rice with Green Gram)",
    "image": "https://traditionallymodernfood.com/wp-content/uploads/2023/10/pachai-payaru-sadham-green-moong-rice-26-scaled.jpeg",
    "usedIngredient": "Green gram",
    "missingCount": 3,
    "time": "25 min",
    "calories": 270,
    "regionKeywords": ["Tamil Nadu"],
    "description": "A protein-rich rice dish made with green gram and mild seasoning.",
    "ingredients": ["Rice", "Green gram", "Cumin seeds", "Ghee", "Salt"],
    "instructions": [
      "Cook rice and green gram together.",
      "Temper cumin seeds in ghee.",
      "Mix tempering with rice and serve."
    ]
  },

  {
    "id": "tm-8",
    "title": "Ellu Urundai (Sesame Jaggery Balls)",
    "image": "https://nativespecial.com/in/wp-content/uploads/sites/3/2019/11/Coimbatore-Ellu-Urundai-DP.jpg",
    "usedIngredient": "Sesame seeds",
    "missingCount": 1,
    "time": "20 min",
    "calories": 300,
    "regionKeywords": ["Tamil Nadu"],
    "description": "A traditional energy-rich sweet made from sesame seeds and jaggery.",
    "ingredients": ["Black sesame seeds", "Jaggery", "Cardamom"],
    "instructions": [
      "Dry roast sesame seeds.",
      "Melt jaggery into syrup.",
      "Mix sesame and jaggery.",
      "Shape into small balls."
    ]
  }
  ];

export default function Recipes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "recommended">("all");
  const [userRegion, setUserRegion] = useState("Global");
  const [search, setSearch] = useState("");
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>(RECIPE_DATABASE);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("region, country").eq("id", user.id).single();
        // Fallback logic to detect India
        if (data?.country === "India" && !data?.region) {
            setUserRegion("India"); 
        } else {
            setUserRegion(data?.region || data?.country || "Global");
        }
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    let result = RECIPE_DATABASE;

    // 1. Filter by Tab
    if (activeTab === "recommended") {
        result = result.filter(r => 
          r.regionKeywords.some(k => userRegion.toLowerCase().includes(k.toLowerCase()))
        );
        // If no matches found for region, show all Indian
        if (result.length === 0 && userRegion !== "Global") {
            // Optional: fallback logic
        }
    }

    // 2. Filter by Search
    if (search) {
      result = result.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
    }

    setDisplayedRecipes(result);
  }, [activeTab, search, userRegion]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- Sticky Header --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-orange-500" />
              Recipe Book
            </h1>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for a dish..." 
                className="w-full bg-gray-100 border-none rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-6 mt-6 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab("all")}
              className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === "all" ? "text-orange-600 border-orange-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
            >
              All Recipes
            </button>
            <button 
              onClick={() => setActiveTab("recommended")}
              className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === "recommended" ? "text-indigo-600 border-indigo-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
            >
              <MapPin className="w-4 h-4" />
              Regional Picks ({userRegion})
            </button>
          </div>
        </div>
      </div>

      {/* --- Recipe Grid --- */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "recommended" && (
           <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-start gap-3">
             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><MapPin className="w-5 h-5" /></div>
             <div>
               <h3 className="text-indigo-900 font-bold text-sm">Personalized for {userRegion}</h3>
               <p className="text-indigo-700 text-xs mt-1">Showing dishes popular in your selected region.</p>
             </div>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRecipes.length > 0 ? displayedRecipes.map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 group cursor-pointer h-full flex flex-col"
            >
               <div className="relative h-48 overflow-hidden">
                 <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" /> {recipe.time}
                 </div>
               </div>
               <div className="p-5 flex flex-col flex-1">
                 <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
                 <p className="text-gray-500 text-xs mb-4 line-clamp-2">{recipe.description}</p>
                 <div className="mt-auto flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" />{recipe.calories} kcal</div>
                    <div className="flex items-center gap-1.5"><Package className="w-4 h-4 text-green-500" /> Uses {recipe.usedIngredient}</div>
                 </div>
               </div>
             </div>
          )) : (
            <div className="col-span-full text-center py-20">
              <div className="text-4xl grayscale opacity-30 mb-2">🍳</div>
              <p className="text-gray-400">No recipes found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Recipe Detail Modal --- */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Image & Quick Stats */}
            <div className="md:w-2/5 h-64 md:h-auto relative">
              <img 
                src={selectedRecipe.image} 
                alt={selectedRecipe.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h2 className="text-2xl font-bold mb-1">{selectedRecipe.title}</h2>
                <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedRecipe.time}</span>
                  <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {selectedRecipe.calories} kcal</span>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="md:w-3/5 p-8 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <List className="w-5 h-5 text-orange-500" />
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600 text-sm">
                      <div className="mt-0.5 min-w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-orange-200 hidden peer-checked:block"></div>
                      </div>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <PlayCircle className="w-5 h-5 text-indigo-500" />
                  Instructions
                </h3>
                <div className="space-y-4">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => {
                    // Close modal first
                    setSelectedRecipe(null);
                    // Navigate to Assistant and pass the recipe name
                    navigate("/assistant", { state: { startCooking: selectedRecipe.title } });
                }}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                Start Cooking with AI Chef
                </button>
                 <button className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition">
                   Save
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}