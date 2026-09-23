// High-Precision Bangladesh Railway Network Coordinates
// Aligned with Google Maps Railway Tracks and OpenRailwayMap

export interface RailLineSegment {
  id: string;
  nameBn: string;
  nameEn: string;
  zone: 'east' | 'west' | 'padma';
  gauge: 'BROAD_GAUGE' | 'METER_GAUGE' | 'DUAL_GAUGE';
  coordinates: [number, number][];
}

export const BANGLADESH_RAIL_NETWORK: RailLineSegment[] = [
  // 1. Dhaka - Chattogram Main Line via Bhairab, Akhaura, Cumilla, Feni (Dual Gauge)
  {
    id: 'line-dhaka-ctg',
    nameBn: 'ঢাকা - চট্টগ্রাম মেইন লাইন (ভৈরব, আখাউড়া, কুমিল্লা, ফেনী)',
    nameEn: 'Dhaka - Chattogram Main Line',
    zone: 'east',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [23.7314, 90.4267], // Dhaka Kamalapur Station
      [23.7378, 90.4255], // Khilgaon Level Crossing Underpass
      [23.7432, 90.4210], // Malibagh Rail Gate
      [23.7485, 90.4120], // Moghbazar Rail Crossing
      [23.7592, 90.3920], // Tejgaon Railway Station
      [23.7710, 90.3940], // Nakhalpara
      [23.7780, 90.3955], // Mohakhali Rail Crossing
      [23.7938, 90.4042], // Banani Rail Station
      [23.8160, 90.4010], // Dhaka Cantonment Station
      [23.8340, 90.4045], // Kuril Flyover Rail Span
      [23.8517, 90.4078], // Dhaka Airport (Bimanbandar)
      [23.8680, 90.4068], // Uttara Sector 1 / Azampur
      [23.8765, 90.4055], // Abdullahpur approach
      [23.8967, 90.4036], // Tongi Junction
      [23.9015, 90.4350], // Tongi East Turag Canal curve
      [23.9038, 90.4680], // Tongi-Pubail curve
      [23.9056, 90.5050], // Pubail Railway Station
      [23.9080, 90.5450], // Pubail East
      [23.9110, 90.5820], // Arikhola (Kaliganj)
      [23.9210, 90.6220], // Sitalakkhya Rail Bridge (Ghorashal)
      [23.9280, 90.6400], // Ghorashal Flag & Station
      [23.9350, 90.6780], // Jinardi
      [23.9214, 90.7208], // Narsingdi Station
      [23.9320, 90.7580], // Arshinagar
      [23.9380, 90.7950], // Amirganj
      [23.9620, 90.8400], // Khanabari
      [23.9850, 90.8800], // Hatubhanga
      [24.0150, 90.9350], // Methikanda (Bhairab Approach)
      [24.0503, 90.9856], // Bhairab Bazar Junction
      [24.0450, 91.0150], // 2nd Meghna Rail Bridge (Shahid Habibur Rahman Bridge)
      [24.0300, 91.0350], // Ashuganj Station
      [24.0050, 91.0720], // Talshahar
      [23.9689, 91.1119], // Brahmanbaria Railway Station
      [23.9250, 91.1620], // Paghachang
      [23.9050, 91.1850], // Bhatshala
      [23.8761, 91.2133], // Akhaura Junction
      [23.8150, 91.1980], // Gangasagar
      [23.7750, 91.1850], // Imambari
      [23.7380, 91.1800], // Kasba
      [23.6850, 91.1820], // Mandabhag
      [23.6250, 91.1800], // Shashidal
      [23.5850, 91.1780], // Rajapur
      [23.5500, 91.1760], // Burichang
      [23.4682, 91.1783], // Cumilla Railway Station
      [23.3550, 91.1550], // Lalmai
      [23.2386, 91.1278], // Laksam Junction
      [23.1850, 91.1800], // Naoti
      [23.1350, 91.2400], // Hasanpur
      [23.0850, 91.3150], // Gunabati
      [23.0500, 91.3550], // Chinki Astana
      [23.0250, 91.3800], // Fazilpur
      [23.0159, 91.3986], // Feni Junction
      [22.9600, 91.4400], // Kalidah
      [22.8450, 91.5350], // Muhuriganj
      [22.7700, 91.5750], // Mirsarai
      [22.6850, 91.6250], // Mastan Nagar
      [22.6180, 91.6600], // Sitakunda
      [22.5600, 91.7000], // Barabkunda
      [22.5100, 91.7200], // Kumira
      [22.4400, 91.7650], // Bhatiari
      [22.3900, 91.7950], // Faujdarhat
      [22.3600, 91.8080], // Pahartali
      [22.3353, 91.8211], // Chattogram Railway Station (Battali)
    ],
  },

  // 2. Chattogram - Dohazari - Cox's Bazar Rail Corridor
  {
    id: 'line-ctg-cxb',
    nameBn: 'চট্টগ্রাম - দোহাজারী - কক্সবাজার আইকনিক রেলওয়ে করিডোর',
    nameEn: "Chattogram - Cox's Bazar Railway Corridor",
    zone: 'east',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [22.3353, 91.8211], // Chattogram Station
      [22.3550, 91.8150], // Jhautala
      [22.3680, 91.8280], // Sholashahar Junction
      [22.3850, 91.8650], // Janalihat
      [22.3955, 91.8845], // Karnaphuli Rail Bridge (Kalurghat)
      [22.3850, 91.9050], // Gomdandi
      [22.3650, 91.9300], // Boalkhali
      [22.3020, 91.9820], // Patiya
      [22.2450, 92.0250], // Kanchannagar
      [22.2050, 92.0450], // Hashimpur
      [22.1644, 92.0628], // Dohazari Station
      [22.0850, 92.0720], // Satkania
      [21.9961, 92.0740], // Lohagara
      [21.8850, 92.0750], // Harbang
      [21.7583, 92.0764], // Chakaria
      [21.6750, 92.0780], // Dulahazara
      [21.5600, 92.0850], // Islamabad
      [21.4397, 92.1025], // Ramu Junction
      [21.4589, 91.9986], // Cox's Bazar Iconic Oyster Station
    ],
  },

  // 3. Akhaura - Shayestaganj - Sreemangal - Kulaura - Sylhet Line
  {
    id: 'line-akhaura-sylhet',
    nameBn: 'আখাউড়া - শ্রীমঙ্গল - কুলাউড়া - সিলেট লাইন',
    nameEn: 'Akhaura - Sreemangal - Sylhet Line',
    zone: 'east',
    gauge: 'METER_GAUGE',
    coordinates: [
      [23.8761, 91.2133], // Akhaura Junction
      [23.9550, 91.2450], // Azampur
      [24.0220, 91.2820], // Montola
      [24.0850, 91.3250], // Harashpur
      [24.1620, 91.3820], // Noyapara
      [24.2150, 91.4350], // Shahjibazar
      [24.2706, 91.4889], // Shayestaganj Junction
      [24.2880, 91.6050], // Rashidpur
      [24.2980, 91.6750], // Satgaon
      [24.3065, 91.7336], // Sreemangal (Tea Capital)
      [24.3820, 91.8320], // Bhanugach
      [24.4320, 91.9120], // Shamshernagar
      [24.4750, 91.9750], // Tilagaon
      [24.5161, 92.0322], // Kulaura Junction
      [24.5820, 92.0120], // Baramchal
      [24.6420, 91.9650], // Bhatkera
      [24.6989, 91.9211], // Maijgaon
      [24.7920, 91.8920], // Moglabazar
      [24.8833, 91.8683], // Sylhet Railway Station
    ],
  },

  // 4. Dhaka - Joydebpur - Jamuna Bridge - Ishwardi Line
  {
    id: 'line-dhaka-jamuna-ishwardi',
    nameBn: 'ঢাকা - জয়দেবপুর - টাঙ্গাইল - বঙ্গবন্ধু সেতু - ঈশ্বরদী লাইন',
    nameEn: 'Dhaka - Jamuna Bridge - Ishwardi Line',
    zone: 'west',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [23.7314, 90.4267], // Dhaka Kamalapur
      [23.7592, 90.3920], // Tejgaon
      [23.8160, 90.4010], // Dhaka Cantonment
      [23.8517, 90.4078], // Dhaka Airport
      [23.8967, 90.4036], // Tongi Junction
      [23.9994, 90.4222], // Joydebpur Junction
      [24.0380, 90.3150], // Mouchak
      [24.1020, 90.1080], // Mirzapur
      [24.1750, 90.0120], // Mohera
      [24.2510, 89.9210], // Tangail Station
      [24.3986, 89.8167], // Bangabandhu Setu East (Jamuna East)
      [24.3975, 89.7765], // Bangabandhu Rail Bridge (over Jamuna River)
      [24.3961, 89.7364], // Bangabandhu Setu West
      [24.3820, 89.6950], // Shahid M. Mansur Ali
      [24.3600, 89.6500], // Jamtail
      [24.3350, 89.6050], // Salap
      [24.3164, 89.5661], // Ullapara
      [24.2620, 89.4420], // Lahiri Mohanpur
      [24.2380, 89.3850], // Dilpashar
      [24.2210, 89.3320], // Boral Bridge
      [24.1920, 89.2420], // Chatmohar
      [24.1780, 89.1550], // Guakhra
      [24.1680, 89.1120], // Muladuli
      [24.1611, 89.0667], // Ishwardi Bypass
      [24.1294, 89.0644], // Ishwardi Junction
    ],
  },

  // 5. Northern Trunk Line: Ishwardi - Natore - Santahar - Parbatipur - Dinajpur - Panchagarh
  {
    id: 'line-ishwardi-north-panchagarh',
    nameBn: 'ঈশ্বরদী - নাটোর - সান্তাহার - পার্বতীপুর - দিনাজপুর - পঞ্চগড়',
    nameEn: 'Northern Trunk Line to Panchagarh',
    zone: 'west',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [24.1611, 89.0667], // Ishwardi Bypass
      [24.2210, 89.0120], // Majhgram
      [24.2817, 88.9483], // Abdulpur Junction
      [24.3450, 88.9620], // Malanchi
      [24.4167, 88.9833], // Natore
      [24.4850, 88.9810], // Basudebpur
      [24.5350, 88.9750], // Madhnagar
      [24.5820, 88.9710], // Ahsanganj
      [24.6850, 88.9680], // Raninagar
      [24.7867, 88.9667], // Santahar Junction
      [24.8450, 88.9950], // Tilakpur
      [24.8820, 89.0210], // Akkelpur
      [24.9850, 89.0220], // Jamalganj
      [25.0920, 89.0200], // Joypurhat
      [25.1820, 89.0120], // Panchbibi
      [25.2350, 89.0020], // Bagjana
      [25.2810, 88.9910], // Hili Border
      [25.3550, 88.9820], // Dangapara
      [25.4320, 88.9710], // Birampur
      [25.5120, 88.9520], // Phulbari
      [25.5950, 88.9350], // Ambari
      [25.6667, 88.9167], // Parbatipur Junction
      [25.6420, 88.7820], // Chirirbandar
      [25.6267, 88.6417], // Dinajpur
      [25.7150, 88.5450], // Mangalpur
      [25.7920, 88.4620], // Setabganj
      [25.8620, 88.3620], // Pirganj
      [25.9350, 88.3950], // Bhomradaha
      [25.9850, 88.4210], // Shibganj
      [26.0310, 88.4520], // Thakurgaon Road
      [26.0950, 88.4680], // Nayanpur
      [26.1520, 88.4820], // Ruhia
      [26.2250, 88.5150], // Kisamat
      [26.3333, 88.5500], // Panchagarh (Bir Muktijoddha Sirajul Islam)
    ],
  },

  // 6. Santahar - Bogura - Gaibandha - Kaunia - Rangpur Line
  {
    id: 'line-santahar-bogura-rangpur',
    nameBn: 'সান্তাহার - বগুড়া - গাইবান্ধা - কাউনিয়া - রংপুর - পার্বতীপুর',
    nameEn: 'Santahar - Bogura - Rangpur Line',
    zone: 'west',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [24.7867, 88.9667], // Santahar Junction
      [24.8220, 89.1520], // Kahaloo
      [24.8481, 89.3731], // Bogura
      [24.9320, 89.4720], // Gabtoli
      [25.0420, 89.5320], // Sonatola
      [25.1420, 89.5520], // Bonarpara Junction
      [25.3283, 89.5417], // Gaibandha
      [25.4520, 89.5220], // Bamondanga
      [25.5620, 89.4620], // Pirgacha
      [25.7120, 89.4220], // Kaunia Junction
      [25.7439, 89.2753], // Rangpur Station
      [25.6750, 89.0520], // Badarganj
      [25.6667, 88.9167], // Parbatipur Junction
    ],
  },

  // 7. Abdulpur - Rajshahi - Chapainawabganj Line
  {
    id: 'line-abdulpur-rajshahi',
    nameBn: 'আব্দুলপুর - রাজশাহী - চাঁপাইনবাবগঞ্জ লাইন',
    nameEn: 'Abdulpur - Rajshahi - Chapainawabganj Line',
    zone: 'west',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [24.2817, 88.9483], // Abdulpur Junction
      [24.2920, 88.8220], // Arani
      [24.3020, 88.7650], // Nandangachi
      [24.3120, 88.7220], // Sardah Road
      [24.3350, 88.6650], // Harian
      [24.3680, 88.6320], // Rajshahi University
      [24.3736, 88.6047], // Rajshahi Station
      [24.3820, 88.5420], // Rajshahi Court
      [24.4250, 88.4850], // Sitlai
      [24.4720, 88.4220], // Kankonhat
      [24.5420, 88.3520], // Amnura Junction
      [24.5920, 88.2720], // Chapainawabganj
    ],
  },

  // 8. Dhaka - Padma Bridge - Bhanga - Narail - Jashore - Khulna (High-Speed Padma Rail Link)
  {
    id: 'line-dhaka-padma-khulna',
    nameBn: 'ঢাকা - পদ্মা সেতু - ভাঙ্গা - নড়াইল - যশোর - খুলনা ও বেনাপোল লিংক',
    nameEn: 'Padma Bridge Rail Link to Khulna & Benapole',
    zone: 'padma',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [23.7314, 90.4267], // Dhaka Kamalapur
      [23.7042, 90.4308], // Gandaria
      [23.6450, 90.3850], // Keraniganj
      [23.5650, 90.3320], // Nimtala
      [23.5150, 90.2980], // Srinagar
      [23.4736, 90.2889], // Mawa Station
      [23.4610, 90.2680], // Padma Viaduct approach
      [23.4485, 90.2450], // Padma Bridge Main Rail Deck (over the Padma River)
      [23.4280, 90.2180], // Jajira (Padma South)
      [23.3980, 90.1320], // Shibchar
      [23.3886, 90.0019], // Bhanga Junction
      [23.3150, 89.8750], // Muksudpur
      [23.2181, 89.7717], // Kashiani Junction
      [23.1950, 89.6450], // Lohagara (Narail)
      [23.1764, 89.5028], // Narail
      [23.1680, 89.3650], // Jamdia
      [23.1667, 89.2167], // Jashore Junction
      [23.1150, 89.3250], // Rupdia
      [23.0550, 89.3950], // Singia
      [22.9520, 89.4720], // Noapara
      [22.8950, 89.5150], // Phultala
      [22.8650, 89.5380], // Daulatpur
      [22.8167, 89.5667], // Khulna Station
    ],
  },

  // 9. Jashore - Benapole Border Branch
  {
    id: 'line-jashore-benapole',
    nameBn: 'যশোর - বেনাপোল আন্তর্জাতিক সীমান্ত লাইন',
    nameEn: 'Jashore - Benapole Border Line',
    zone: 'padma',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [23.1667, 89.2167], // Jashore Junction
      [23.1020, 89.0420], // Jhikargacha
      [23.0620, 88.9620], // Navaran
      [23.0422, 88.8953], // Benapole International Station
    ],
  },

  // 10. Western Mainline: Ishwardi - Poradaha - Chuadanga - Darshana - Jashore - Khulna
  {
    id: 'line-ishwardi-poradaha-khulna',
    nameBn: 'ঈশ্বরদী - পাকশী - হার্ডিঞ্জ ব্রিজ - পোড়াদহ - চুয়াডাঙ্গা - দর্শনা - যশোর - খুলনা',
    nameEn: 'Ishwardi - Poradaha - Jashore - Khulna Line',
    zone: 'west',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [24.1294, 89.0644], // Ishwardi Junction
      [24.0920, 89.0420], // Paksey
      [24.0805, 89.0285], // Hardinge Rail Bridge (Iconic Rail Bridge over Padma)
      [24.0220, 88.9920], // Bheramara
      [23.9550, 88.9650], // Mirpur
      [23.9020, 88.9420], // Poradaha Junction
      [23.8350, 88.9220], // Halsha
      [23.7720, 88.9020], // Alamdanga
      [23.7050, 88.8750], // Munshiganj
      [23.6420, 88.8520], // Chuadanga
      [23.5780, 88.8320], // Joyrampur
      [23.5220, 88.8120], // Darshana Halt (Indo-Bangla Border)
      [23.4750, 88.8750], // Uthali
      [23.4120, 88.9820], // Kotchandpur
      [23.2820, 89.1320], // Mobarakganj
      [23.2250, 89.1750], // Barobazar
      [23.1667, 89.2167], // Jashore Junction
      [23.1150, 89.3250], // Rupdia
      [22.9520, 89.4720], // Noapara
      [22.8650, 89.5380], // Daulatpur
      [22.8167, 89.5667], // Khulna
    ],
  },

  // 11. Tongi - Joydebpur - Gafargaon - Mymensingh - Jamalpur - Dewanganj Line
  {
    id: 'line-dhaka-mymensingh',
    nameBn: 'টঙ্গী - জয়দেবপুর - গফরগাঁও - ময়মনসিংহ - জামালপুর - দেওয়ানগঞ্জ',
    nameEn: 'Tongi - Mymensingh - Jamalpur - Dewanganj Line',
    zone: 'east',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [23.8967, 90.4036], // Tongi Junction
      [23.9994, 90.4222], // Joydebpur Junction
      [24.1120, 90.4520], // Rajendrapur
      [24.2020, 90.4720], // Sreepur
      [24.3120, 90.5120], // Kaoraid
      [24.4317, 90.5519], // Gafargaon
      [24.5720, 90.5120], // Fathehnagar
      [24.7578, 90.4072], // Mymensingh Junction
      [24.8420, 90.1820], // Piyarpur
      [24.9197, 90.0300], // Nandina
      [24.9197, 89.9483], // Jamalpur Town Junction
      [25.0220, 89.8620], // Melandaha
      [25.0820, 89.8120], // Islampur
      [25.1389, 89.7744], // Dewanganj Bazar
    ],
  },

  // 12. Laksam - Chandpur Branch Line
  {
    id: 'line-laksam-chandpur',
    nameBn: 'লাকসাম - চাঁদপুর ইলিশ করিডোর',
    nameEn: 'Laksam - Chandpur Line',
    zone: 'east',
    gauge: 'METER_GAUGE',
    coordinates: [
      [23.2386, 91.1278], // Laksam Junction
      [23.2450, 91.0250], // Chitoshi Road
      [23.2500, 90.9350], // Shahrasti
      [23.2550, 90.8520], // Hajiganj
      [23.2480, 90.7420], // Madhuroad
      [23.2300, 90.6650], // Chandpur Court
      [23.2200, 90.6500], // Chandpur Railway Station
    ],
  },

  // 13. Bhanga - Faridpur - Rajbari - Poradaha Line
  {
    id: 'line-bhanga-rajbari-poradaha',
    nameBn: 'ভাঙ্গা - ফরিদপুর - রাজবাড়ী - কুষ্টিয়া - পোড়াদহ',
    nameEn: 'Bhanga - Faridpur - Rajbari - Poradaha Line',
    zone: 'padma',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [23.3886, 90.0019], // Bhanga Junction
      [23.4650, 89.9250], // Talma
      [23.6050, 89.8420], // Faridpur
      [23.7550, 89.6500], // Rajbari
      [23.7850, 89.4200], // Pangsha
      [23.8750, 89.2450], // Kumarkhali
      [23.9050, 89.1250], // Kushtia Court
      [23.9020, 88.9420], // Poradaha Junction
    ],
  },

  // 14. Khulna - Phultala - Rupsha Rail Bridge - Mongla Port High-Capacity Rail Link
  {
    id: 'line-khulna-mongla-port',
    nameBn: 'খুলনা - ফুলতলা - রূপসা রেল সেতু - মোংলা সমুদ্রবন্দর লাইন',
    nameEn: 'Khulna - Rupsha Rail Bridge - Mongla Port Line',
    zone: 'padma',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [22.8950, 89.5150], // Phultala Junction
      [22.8550, 89.5420], // Aranghata
      [22.8167, 89.5667], // Khulna
      [22.7850, 89.5850], // Mohammadnagar
      [22.7550, 89.5820], // 5.13 km Rupsha Dedicated Rail Bridge
      [22.7150, 89.5750], // Katakhali
      [22.6520, 89.5820], // Chulkati
      [22.5850, 89.5950], // Bagerhat Digraj
      [22.5250, 89.6020], // Mongla Industrial zone
      [22.4820, 89.6050], // Mongla Seaport Terminal
    ],
  },

  // 15. Parbatipur - Kaunia - Lalmonirhat - Burimari Border Corridor
  {
    id: 'line-parbatipur-lalmonirhat-burimari',
    nameBn: 'পার্বতীপুর - কাউনিয়া - লালমনিরহাট - পাটগ্রাম - বুড়িমারী স্থলবন্দর',
    nameEn: 'Parbatipur - Lalmonirhat - Burimari Border Corridor',
    zone: 'west',
    gauge: 'METER_GAUGE',
    coordinates: [
      [25.6667, 88.9167], // Parbatipur Junction
      [25.6750, 89.0520], // Badarganj
      [25.7439, 89.2753], // Rangpur
      [25.7120, 89.4220], // Kaunia Junction
      [25.7550, 89.4320], // Teesta Rail Bridge
      [25.9180, 89.4480], // Lalmonirhat Junction
      [25.9850, 89.3450], // Mahendranagar
      [26.0520, 89.2420], // Tushbhandar
      [26.1550, 89.1550], // Hatibandha
      [26.3450, 89.0120], // Patgram
      [26.3980, 88.9850], // Baura
      [26.4250, 88.9720], // Burimari International Border Terminal
    ],
  },

  // 16. Mymensingh - Shamganj - Netrokona - Mohanganj Haor Express Corridor
  {
    id: 'line-mymensingh-mohanganj',
    nameBn: 'ময়মনসিংহ - শ্যামগঞ্জ - নেত্রকোনা - মোহনগঞ্জ হাওর এক্সপ্রেস লাইন',
    nameEn: 'Mymensingh - Netrokona - Mohanganj Haor Line',
    zone: 'east',
    gauge: 'METER_GAUGE',
    coordinates: [
      [24.7578, 90.4072], // Mymensingh Junction
      [24.7850, 90.4850], // Shambhuganj
      [24.8150, 90.5750], // Bishka
      [24.8450, 90.6550], // Shamganj Junction
      [24.8750, 90.7250], // Netrokona Court
      [24.8850, 90.7420], // Netrokona Railway Station
      [24.8920, 90.8450], // Barhatta
      [24.8680, 90.9650], // Mohanganj Haor Terminal
    ],
  },

  // 17. Sylhet - Chhatak Bazar Branch Line
  {
    id: 'line-sylhet-chhatak',
    nameBn: 'সিলেট - ছাতক বাজার লাইন',
    nameEn: 'Sylhet - Chhatak Bazar Branch Line',
    zone: 'east',
    gauge: 'METER_GAUGE',
    coordinates: [
      [24.8833, 91.8683], // Sylhet Station
      [24.9120, 91.8150], // Khadimnagar
      [24.9550, 91.7450], // Salutikar
      [24.9950, 91.6850], // Afzalabad
      [25.0380, 91.6620], // Chhatak Bazar Lime & Mineral Terminal
    ],
  },
];

// Clean Schematic Representation of Bangladesh Railway Network
// Stylized geometric transit corridors connecting stations for fast overview
export const BANGLADESH_RAIL_NETWORK_SCHEMATIC: RailLineSegment[] = [
  {
    id: 'schematic-dhaka-ctg',
    nameBn: 'ঢাকা - চট্টগ্রাম এক্সপ্রেস করিডোর (স্কিম্যাটিক)',
    nameEn: 'Dhaka - Chattogram Schematic Corridor',
    zone: 'east',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [23.7314, 90.4267], // Dhaka Kamalapur
      [23.8517, 90.4078], // Airport
      [23.8967, 90.4036], // Tongi Junction
      [23.9056, 90.5050], // Pubail
      [23.9214, 90.7208], // Narsingdi
      [24.0503, 90.9856], // Bhairab Bazar Junction
      [24.0450, 91.0150], // Meghna Bridge
      [23.9689, 91.1119], // Brahmanbaria
      [23.8761, 91.2133], // Akhaura Junction
      [23.4682, 91.1783], // Cumilla
      [23.2386, 91.1278], // Laksam Junction
      [23.0159, 91.3986], // Feni Junction
      [22.6180, 91.6600], // Sitakunda
      [22.3353, 91.8211], // Chattogram Battali
    ],
  },
  {
    id: 'schematic-ctg-cxb',
    nameBn: 'চট্টগ্রাম - কক্সবাজার আইকনিক করিডোর (স্কিম্যাটিক)',
    nameEn: "Chattogram - Cox's Bazar Schematic",
    zone: 'east',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [22.3353, 91.8211], // Chattogram
      [22.3955, 91.8845], // Kalurghat Bridge
      [22.1644, 92.0628], // Dohazari
      [21.9961, 92.0740], // Lohagara
      [21.7583, 92.0764], // Chakaria
      [21.4397, 92.1025], // Ramu Junction
      [21.4589, 91.9986], // Cox's Bazar Iconic
    ],
  },
  {
    id: 'schematic-akhaura-sylhet',
    nameBn: 'আখাউড়া - শ্রীমঙ্গল - সিলেট করিডোর (স্কিম্যাটিক)',
    nameEn: 'Akhaura - Sreemangal - Sylhet Schematic',
    zone: 'east',
    gauge: 'METER_GAUGE',
    coordinates: [
      [23.8761, 91.2133], // Akhaura
      [24.2706, 91.4889], // Shayestaganj
      [24.3065, 91.7336], // Sreemangal
      [24.5161, 92.0322], // Kulaura Junction
      [24.6989, 91.9211], // Maijgaon
      [24.8833, 91.8683], // Sylhet
    ],
  },
  {
    id: 'schematic-dhaka-jamuna-ishwardi',
    nameBn: 'ঢাকা - যমুনা সেতু - ঈশ্বরদী করিডোর (স্কিম্যাটিক)',
    nameEn: 'Dhaka - Jamuna Bridge - Ishwardi Schematic',
    zone: 'west',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [23.7314, 90.4267], // Dhaka
      [23.8967, 90.4036], // Tongi
      [23.9994, 90.4222], // Joydebpur
      [24.2510, 89.9210], // Tangail
      [24.3975, 89.7765], // Bangabandhu Jamuna Rail Bridge
      [24.3164, 89.5661], // Ullapara
      [24.1611, 89.0667], // Ishwardi Bypass
      [24.1294, 89.0644], // Ishwardi Junction
    ],
  },
  {
    id: 'schematic-ishwardi-panchagarh',
    nameBn: 'ঈশ্বরদী - সান্তাহার - পার্বতীপুর - পঞ্চগড় (স্কিম্যাটিক)',
    nameEn: 'Ishwardi - Panchagarh Schematic',
    zone: 'west',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [24.1294, 89.0644], // Ishwardi
      [24.4167, 88.9833], // Natore
      [24.7867, 88.9667], // Santahar
      [25.0920, 89.0200], // Joypurhat
      [25.6667, 88.9167], // Parbatipur
      [25.6267, 88.6417], // Dinajpur
      [26.0310, 88.4520], // Thakurgaon
      [26.3333, 88.5500], // Panchagarh
    ],
  },
  {
    id: 'schematic-santahar-rangpur',
    nameBn: 'সান্তাহার - বগুড়া - রংপুর করিডোর (স্কিম্যাটিক)',
    nameEn: 'Santahar - Bogura - Rangpur Schematic',
    zone: 'west',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [24.7867, 88.9667], // Santahar
      [24.8481, 89.3731], // Bogura
      [25.3283, 89.5417], // Gaibandha
      [25.7120, 89.4220], // Kaunia Junction
      [25.7439, 89.2753], // Rangpur
      [25.6667, 88.9167], // Parbatipur
    ],
  },
  {
    id: 'schematic-abdulpur-rajshahi',
    nameBn: 'আব্দুলপুর - রাজশাহী - চাঁপাইনবাবগঞ্জ (স্কিম্যাটিক)',
    nameEn: 'Abdulpur - Rajshahi Schematic',
    zone: 'west',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [24.2817, 88.9483], // Abdulpur
      [24.3736, 88.6047], // Rajshahi
      [24.5920, 88.2720], // Chapainawabganj
    ],
  },
  {
    id: 'schematic-padma-khulna',
    nameBn: 'ঢাকা - পদ্মা সেতু - ভাঙ্গা - যশোর - খুলনা (স্কিম্যাটিক)',
    nameEn: 'Padma Bridge Rail Link Schematic',
    zone: 'padma',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [23.7314, 90.4267], // Dhaka
      [23.4736, 90.2889], // Mawa
      [23.4485, 90.2450], // Padma Bridge
      [23.3886, 90.0019], // Bhanga
      [23.1764, 89.5028], // Narail
      [23.1667, 89.2167], // Jashore
      [22.8167, 89.5667], // Khulna
    ],
  },
  {
    id: 'schematic-ishwardi-poradaha-khulna',
    nameBn: 'ঈশ্বরদী - হার্ডিঞ্জ ব্রিজ - পোড়াদহ - চুয়াডাঙ্গা - খুলনা (স্কিম্যাটিক)',
    nameEn: 'Western Mainline Schematic',
    zone: 'west',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [24.1294, 89.0644], // Ishwardi
      [24.0805, 89.0285], // Hardinge Bridge
      [23.9020, 88.9420], // Poradaha
      [23.6420, 88.8520], // Chuadanga
      [23.5220, 88.8120], // Darshana
      [23.1667, 89.2167], // Jashore
      [22.8167, 89.5667], // Khulna
    ],
  },
  {
    id: 'schematic-dhaka-mymensingh',
    nameBn: 'ঢাকা - ময়মনসিংহ - জামালপুর - দেওয়ানগঞ্জ (স্কিম্যাটিক)',
    nameEn: 'Dhaka - Mymensingh Schematic',
    zone: 'east',
    gauge: 'DUAL_GAUGE',
    coordinates: [
      [23.7314, 90.4267], // Dhaka
      [23.8967, 90.4036], // Tongi
      [23.9994, 90.4222], // Joydebpur
      [24.4317, 90.5519], // Gafargaon
      [24.7578, 90.4072], // Mymensingh
      [24.9197, 89.9483], // Jamalpur
      [25.1389, 89.7744], // Dewanganj
    ],
  },
  {
    id: 'schematic-khulna-mongla',
    nameBn: 'খুলনা - রূপসা সেতু - মোংলা সমুদ্রবন্দর (স্কিম্যাটিক)',
    nameEn: 'Khulna - Mongla Port Schematic',
    zone: 'padma',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [22.8167, 89.5667], // Khulna
      [22.7550, 89.5820], // Rupsha Rail Bridge
      [22.4820, 89.6050], // Mongla Port
    ],
  },
  {
    id: 'schematic-jashore-benapole',
    nameBn: 'যশোর - বেনাপোল আন্তর্জাতিক লিংক (স্কিম্যাটিক)',
    nameEn: 'Jashore - Benapole Schematic',
    zone: 'padma',
    gauge: 'BROAD_GAUGE',
    coordinates: [
      [23.1667, 89.2167], // Jashore
      [23.0422, 88.8953], // Benapole
    ],
  },
];

// Highlighted In-Line Railway Landmarks, Junctions & Engineering Marvels
export interface InlineRailLandmark {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'junction' | 'bridge' | 'terminal' | 'border';
  badgeLabelBn: string;
  badgeLabelEn: string;
  lat: number;
  lng: number;
  colorScheme: 'amber' | 'emerald' | 'cyan' | 'purple' | 'rose' | 'blue';
  descriptionBn: string;
  isPriority: boolean; // Always visible on map
}

export const INLINE_RAIL_LANDMARKS: InlineRailLandmark[] = [
  // Major Central Terminals & Junctions
  {
    id: 'DA-LANDMARK',
    nameBn: 'ঢাকা (কমলাপুর)',
    nameEn: 'Dhaka Kamalapur Terminal',
    category: 'terminal',
    badgeLabelBn: 'প্রধান রেলওয়ে টার্মিনাল',
    badgeLabelEn: 'Central Rail Terminal',
    lat: 23.7314,
    lng: 90.4267,
    colorScheme: 'emerald',
    descriptionBn: 'বাংলাদেশ রেলওয়ের বৃহত্তম ও প্রধান কেন্দ্রীয় রেলওয়ে টার্মিনাল (৮টি প্ল্যাটফর্ম)',
    isPriority: true,
  },
  {
    id: 'TG-LANDMARK',
    nameBn: 'টঙ্গী জংশন',
    nameEn: 'Tongi Junction',
    category: 'junction',
    badgeLabelBn: 'ব্যস্ততম ৩-মুখী জংশন',
    badgeLabelEn: 'Busiest Rail Junction',
    lat: 23.8967,
    lng: 90.4036,
    colorScheme: 'amber',
    descriptionBn: 'ঢাকা-চট্টগ্রাম, সিলেট ও ময়মনসিংহ-যমুনা লাইনের ব্যস্ততম ত্রি-মুখী রেলওয়ে জংশন',
    isPriority: true,
  },
  {
    id: 'JDP-LANDMARK',
    nameBn: 'জয়দেবপুর জংশন',
    nameEn: 'Joydebpur Junction',
    category: 'junction',
    badgeLabelBn: 'উত্তর-পশ্চিমাঞ্চল সংযোগ',
    badgeLabelEn: 'North-West Rail Node',
    lat: 23.9994,
    lng: 90.4222,
    colorScheme: 'amber',
    descriptionBn: 'বঙ্গবন্ধু সেতু লিংক ও ময়মনসিংহ লাইনের সংযোগস্থল',
    isPriority: true,
  },
  {
    id: 'DAA-LANDMARK',
    nameBn: 'ঢাকা বিমানবন্দর স্টেশন',
    nameEn: 'Dhaka Airport Station',
    category: 'terminal',
    badgeLabelBn: 'এয়ারপোর্ট রেলওয়ে হাব',
    badgeLabelEn: 'Airport Transit Hub',
    lat: 23.8517,
    lng: 90.4078,
    colorScheme: 'blue',
    descriptionBn: 'হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দরের প্রধান রেলওয়ে প্রবেশদ্বার',
    isPriority: false,
  },

  // Iconic Bridges
  {
    id: 'JAMUNA-BRIDGE-LANDMARK',
    nameBn: 'বঙ্গবন্ধু রেল সেতু (যমুনা)',
    nameEn: 'Bangabandhu Dedicated Rail Bridge',
    category: 'bridge',
    badgeLabelBn: '৪.৮ কিমি ডেডিকেটেড রেল সেতু',
    badgeLabelEn: 'Dedicated Rail Bridge (Jamuna)',
    lat: 24.3975,
    lng: 89.7765,
    colorScheme: 'cyan',
    descriptionBn: 'যমুনা নদীর ওপর নবনির্মিত দ্বৈত ডুয়েল গেজ ৪.৮ কিমি দীর্ঘ ডেডিকেটেড রেলওয়ে সেতু',
    isPriority: true,
  },
  {
    id: 'PADMA-BRIDGE-LANDMARK',
    nameBn: 'পদ্মা বহুমুখী রেল সেতু',
    nameEn: 'Padma Multipurpose Rail Deck',
    category: 'bridge',
    badgeLabelBn: '৬.১৫ কিমি দোতলা রেলওয়ে ডেক',
    badgeLabelEn: 'Padma Rail Deck (6.15 km)',
    lat: 23.4485,
    lng: 90.2450,
    colorScheme: 'cyan',
    descriptionBn: 'পদ্মা নদীর ওপর বাংলাদেশের দীর্ঘতম দোতলা ৬.১৫ কিমি রেলওয়ে স্প্যান ও ভায়াডাক্ট',
    isPriority: true,
  },
  {
    id: 'HARDINGE-BRIDGE-LANDMARK',
    nameBn: 'ঐতিহাসিক হার্ডিঞ্জ রেল সেতু',
    nameEn: 'Historic Hardinge Bridge (Paksey)',
    category: 'bridge',
    badgeLabelBn: '১.৮ কিমি স্টিল ট্রাস রেল সেতু',
    badgeLabelEn: 'Historic Steel Truss Bridge',
    lat: 24.0805,
    lng: 89.0285,
    colorScheme: 'cyan',
    descriptionBn: '১৯১৫ সালে নির্মিত পদ্মাপাড়ের ঐতিহ্যবাহী ১.৮ কিমি স্টিল আর্চ রেল সেতু',
    isPriority: true,
  },
  {
    id: 'MEGHNA-BRIDGE-LANDMARK',
    nameBn: 'ভৈরব ২য় মেঘনা রেল সেতু',
    nameEn: '2nd Meghna Rail Bridge (Bhairab)',
    category: 'bridge',
    badgeLabelBn: 'শহীদ হাবিবুর রহমান সেতু',
    badgeLabelEn: 'Meghna Rail Span (1 km)',
    lat: 24.0450,
    lng: 91.0150,
    colorScheme: 'cyan',
    descriptionBn: 'মেঘনা নদীর ওপর আধুনিক ডুয়েল গেজ ১ কিমি দীর্ঘ রেলওয়ে সেতু',
    isPriority: true,
  },
  {
    id: 'KALURGHAT-BRIDGE-LANDMARK',
    nameBn: 'কালুরঘাট কর্ণফুলী রেল সেতু',
    nameEn: 'Kalurghat Karnaphuli Bridge',
    category: 'bridge',
    badgeLabelBn: 'কক্সবাজার লাইনের প্রবেশদ্বার',
    badgeLabelEn: 'Karnaphuli Rail Crossing',
    lat: 22.3955,
    lng: 91.8845,
    colorScheme: 'cyan',
    descriptionBn: 'কর্ণফুলী নদীর ওপর কক্সবাজার আইকনিক রেল করিডোরের ঐতিহাসিক সংযোগ সেতু',
    isPriority: true,
  },
  {
    id: 'RUPSHA-BRIDGE-LANDMARK',
    nameBn: 'রূপসা রেল সেতু (মোংলা লিংক)',
    nameEn: 'Rupsha Rail Bridge (Mongla Link)',
    category: 'bridge',
    badgeLabelBn: '৫.১৩ কিমি রূপসা রেল সেতু',
    badgeLabelEn: 'Rupsha Bridge (5.13 km)',
    lat: 22.7550,
    lng: 89.5820,
    colorScheme: 'cyan',
    descriptionBn: 'খুলনা-মোংলা পোর্ট রেল সংযোগের জন্য নির্মিত ৫.১৩ কিমি দীর্ঘ বিশেষ রেলওয়ে সেতু',
    isPriority: true,
  },

  // Eastern Line Key Junctions & Terminals
  {
    id: 'BBR-LANDMARK',
    nameBn: 'ভৈরব বাজার জংশন',
    nameEn: 'Bhairab Bazar Junction',
    category: 'junction',
    badgeLabelBn: 'কিশোরগঞ্জ ও চট্টগ্রাম লাইন জংশন',
    badgeLabelEn: 'Bhairab Rail Junction',
    lat: 24.0503,
    lng: 90.9856,
    colorScheme: 'amber',
    descriptionBn: 'ঢাকা-চট্টগ্রাম মেইন লাইন ও ময়মনসিংহ-কিশোরগঞ্জ লাইনের সংযোগ জংশন',
    isPriority: true,
  },
  {
    id: 'AKH-LANDMARK',
    nameBn: 'আখাউড়া জংশন',
    nameEn: 'Akhaura Junction',
    category: 'junction',
    badgeLabelBn: 'সিলেট-চট্টগ্রাম প্রধান জংশন',
    badgeLabelEn: 'East Zone Strategic Junction',
    lat: 23.8761,
    lng: 91.2133,
    colorScheme: 'amber',
    descriptionBn: 'ঢাকা, চট্টগ্রাম, সিলেট ও ভারত ট্রানজিট রুটের মূল কৌশলগত রেলওয়ে জংশন',
    isPriority: true,
  },
  {
    id: 'LAK-LANDMARK',
    nameBn: 'লাকসাম জংশন',
    nameEn: 'Laksam Junction',
    category: 'junction',
    badgeLabelBn: '৪-মুখী দক্ষিণ-পূর্বাঞ্চল জংশন',
    badgeLabelEn: '4-Way Junction (Chandpur/Noakhali)',
    lat: 23.2386,
    lng: 91.1278,
    colorScheme: 'amber',
    descriptionBn: 'চট্টগ্রাম, ঢাকা, নোয়াখালী ও চাঁদপুরমুখী ৪টি লাইনের বৃহৎ রেলওয়ে জংশন',
    isPriority: true,
  },
  {
    id: 'FEN-LANDMARK',
    nameBn: 'ফেনী জংশন',
    nameEn: 'Feni Junction',
    category: 'junction',
    badgeLabelBn: 'বিলোনিয়া সীমান্ত জংশন',
    badgeLabelEn: 'Feni Rail Junction',
    lat: 23.0159,
    lng: 91.3986,
    colorScheme: 'amber',
    descriptionBn: 'ঢাকা-চট্টগ্রাম মেইন লাইনের গুরুত্বপূর্ণ ইন্টারচেঞ্জ',
    isPriority: false,
  },
  {
    id: 'CTG-LANDMARK',
    nameBn: 'চট্টগ্রাম (বটতলী)',
    nameEn: 'Chattogram Battali Terminal',
    category: 'terminal',
    badgeLabelBn: 'পূর্বাঞ্চলীয় সদর টার্মিনাল',
    badgeLabelEn: 'Eastern Railway HQ Terminal',
    lat: 22.3353,
    lng: 91.8211,
    colorScheme: 'emerald',
    descriptionBn: 'বাংলাদেশ রেলওয়ে পূর্বাঞ্চল জোনের প্রধান সদর দফতর ও ঐতিহাসিক টার্মিনাল',
    isPriority: true,
  },
  {
    id: 'CXB-LANDMARK',
    nameBn: 'কক্সবাজার আইকনিক স্টেশন',
    nameEn: "Cox's Bazar Iconic Oyster Terminal",
    category: 'terminal',
    badgeLabelBn: 'ঝিনুক আকৃতির আন্তর্জাতিক স্টেশন',
    badgeLabelEn: 'Iconic Oyster Terminal',
    lat: 21.4589,
    lng: 91.9986,
    colorScheme: 'purple',
    descriptionBn: 'বিশ্বমানের আধুনিক স্থাপত্যে নির্মিত ঝিনুক আকৃতির দৃষ্টিনন্দন আইকনিক রেলওয়ে স্টেশন',
    isPriority: true,
  },
  {
    id: 'RAMU-LANDMARK',
    nameBn: 'রামু জংশন',
    nameEn: 'Ramu Junction',
    category: 'junction',
    badgeLabelBn: 'ঘুমধুম ও কক্সবাজার সংযোগ',
    badgeLabelEn: 'Ramu Junction',
    lat: 21.4397,
    lng: 92.1025,
    colorScheme: 'amber',
    descriptionBn: 'কক্সবাজার ও সীমান্তমুখী ঘুমধুম রেল লাইনের সংযোগ জংশন',
    isPriority: false,
  },
  {
    id: 'SRM-LANDMARK',
    nameBn: 'শ্রীমঙ্গল স্টেশন',
    nameEn: 'Sreemangal (Tea Capital)',
    category: 'terminal',
    badgeLabelBn: 'চায়ের রাজধানী স্টেশন',
    badgeLabelEn: 'Tea Capital Station',
    lat: 24.3065,
    lng: 91.7336,
    colorScheme: 'emerald',
    descriptionBn: 'চা বাগান ঘেরা সুরম্য পাহাড়ি রেলওয়ে স্টেশন',
    isPriority: true,
  },
  {
    id: 'KUL-LANDMARK',
    nameBn: 'কুলাউড়া জংশন',
    nameEn: 'Kulaura Junction',
    category: 'junction',
    badgeLabelBn: 'শাহবাজপুর লাইন জংশন',
    badgeLabelEn: 'Kulaura Junction',
    lat: 24.5161,
    lng: 92.0322,
    colorScheme: 'amber',
    descriptionBn: 'সিলেট মেইন লাইন ও ভারতের মহিসাশনমুখী ঐতিহ্যবাহী রেল জংশন',
    isPriority: false,
  },
  {
    id: 'SYL-LANDMARK',
    nameBn: 'সিলেট রেলওয়ে স্টেশন',
    nameEn: 'Sylhet Railway Station',
    category: 'terminal',
    badgeLabelBn: 'সুরমা ভ্যালি টার্মিনাল',
    badgeLabelEn: 'Surma Valley Terminal',
    lat: 24.8833,
    lng: 91.8683,
    colorScheme: 'emerald',
    descriptionBn: 'হযরত শাহজালাল (রহ.) পুণ্যভূমি সিলেটের প্রধান নান্দনিক রেলওয়ে টার্মিনাল',
    isPriority: true,
  },

  // Western & Northern Lines
  {
    id: 'BHN-LANDMARK',
    nameBn: 'ভাঙ্গা জংশন',
    nameEn: 'Bhanga Junction',
    category: 'junction',
    badgeLabelBn: 'পদ্মা সেন্ট্রাল ৫-মুখী জংশন',
    badgeLabelEn: 'Padma Rail Central Junction',
    lat: 23.3886,
    lng: 90.0019,
    colorScheme: 'purple',
    descriptionBn: 'পদ্মা সেতু করিডোর, যশোর, খুলনা, বরিশাল ও রাজবাড়ী রুটের আধুনিক মেগা জংশন',
    isPriority: true,
  },
  {
    id: 'ISW-LANDMARK',
    nameBn: 'ঈশ্বরদী জংশন',
    nameEn: 'Ishwardi Junction',
    category: 'junction',
    badgeLabelBn: 'পশ্চিমাঞ্চলীয় প্রধান জংশন',
    badgeLabelEn: 'Western Zone Grand Junction',
    lat: 24.1294,
    lng: 89.0644,
    colorScheme: 'amber',
    descriptionBn: 'পশ্চিমাঞ্চল রেলওয়ের বৃহত্তম ইয়ার্ড ও হার্ডিঞ্জ ব্রিজ সংলগ্ন মূল রেলওয়ে হাব',
    isPriority: true,
  },
  {
    id: 'SAN-LANDMARK',
    nameBn: 'সান্তাহার জংশন',
    nameEn: 'Santahar Junction',
    category: 'junction',
    badgeLabelBn: 'উত্তরবঙ্গের প্রধান ডুয়েল গেজ জংশন',
    badgeLabelEn: 'North Bengal Grand Junction',
    lat: 24.7867,
    lng: 88.9667,
    colorScheme: 'amber',
    descriptionBn: 'বগুড়া-রংপুর ও ব্রডগেজ মেইন লাইনের অন্যতম বৃহত্তম রেলওয়ে জংশন',
    isPriority: true,
  },
  {
    id: 'PAR-LANDMARK',
    nameBn: 'পার্বতীপুর ৪-মুখী জংশন',
    nameEn: 'Parbatipur 4-Way Junction',
    category: 'junction',
    badgeLabelBn: '৪-মুখী কেন্দ্রীয় লোকোশেড জংশন',
    badgeLabelEn: '4-Way Locomotive Junction',
    lat: 25.6667,
    lng: 88.9167,
    colorScheme: 'amber',
    descriptionBn: 'দিনাজপুর, রংপুর, সান্তাহার ও চিলাহাটিমুখী ৪-মুখী ব্রডগেজ/মিটারগেজ রেলওয়ে সদর',
    isPriority: true,
  },
  {
    id: 'RAJ-LANDMARK',
    nameBn: 'রাজশাহী স্টেশন',
    nameEn: 'Rajshahi Terminal',
    category: 'terminal',
    badgeLabelBn: 'পদ্মাপাড়ের সিল্ক সিটি টার্মিনাল',
    badgeLabelEn: 'Silk City Terminal',
    lat: 24.3736,
    lng: 88.6047,
    colorScheme: 'emerald',
    descriptionBn: 'শিক্ষা ও রেশম নগরী রাজশাহীর প্রধান কেন্দ্রীয় রেলওয়ে টার্মিনাল',
    isPriority: true,
  },
  {
    id: 'PAN-LANDMARK',
    nameBn: 'পঞ্চগড় (বীর মুক্তিযোদ্ধা সিরাজুল ইসলাম)',
    nameEn: 'Panchagarh Terminal',
    category: 'terminal',
    badgeLabelBn: 'সর্ব-উত্তরের সীমান্ত রেল টার্মিনাল',
    badgeLabelEn: 'Northernmost Rail Terminal',
    lat: 26.3333,
    lng: 88.5500,
    colorScheme: 'emerald',
    descriptionBn: 'হিমালয় পাদদেশের বাংলাদেশের সর্ব উত্তরের আধুনিক ব্রডগেজ রেলওয়ে স্টেশন',
    isPriority: true,
  },
  {
    id: 'JAS-LANDMARK',
    nameBn: 'যশোর জংশন',
    nameEn: 'Jashore Junction',
    category: 'junction',
    badgeLabelBn: 'বেনাপোল ও পদ্মা লিংক জংশন',
    badgeLabelEn: 'Jashore Junction',
    lat: 23.1667,
    lng: 89.2167,
    colorScheme: 'amber',
    descriptionBn: 'পদ্মা সেতু সরাসরি রুট, খুলনা, দর্শনা ও বেনাপোল রুটের গুরুত্বপূর্ণ জংশন',
    isPriority: true,
  },
  {
    id: 'KHU-LANDMARK',
    nameBn: 'খুলনা স্টেশন',
    nameEn: 'Khulna Terminal',
    category: 'terminal',
    badgeLabelBn: 'সুন্দরবন ও রূপসা টার্মিনাল',
    badgeLabelEn: 'Khulna Terminal',
    lat: 22.8167,
    lng: 89.5667,
    colorScheme: 'emerald',
    descriptionBn: 'দক্ষিণাঞ্চলের প্রধান বিভাগীয় আধুনিক রেলওয়ে টার্মিনাল ও লোকো ডিপো',
    isPriority: true,
  },
  {
    id: 'BEN-LANDMARK',
    nameBn: 'বেনাপোল আন্তর্জাতিক স্টেশন',
    nameEn: 'Benapole International Terminal',
    category: 'border',
    badgeLabelBn: 'আন্তর্জাতিক স্থলবন্দর রেল ট্রানজিট',
    badgeLabelEn: 'Indo-Bangla Border Terminal',
    lat: 23.0422,
    lng: 88.8953,
    colorScheme: 'rose',
    descriptionBn: 'বন্ধন এক্সপ্রেস ও আন্তর্জাতিক পণ্যবাহী ট্রেন গমনাগমনের বৃহত্তম সীমান্ত রেলওয়ে টার্মিনাল',
    isPriority: true,
  },
  {
    id: 'MON-LANDMARK',
    nameBn: 'মোংলা সমুদ্রবন্দর টার্মিনাল',
    nameEn: 'Mongla Port Rail Terminal',
    category: 'terminal',
    badgeLabelBn: 'দ্বিতীয় সমুদ্রবন্দর রেল হাব',
    badgeLabelEn: 'Seaport Rail Hub',
    lat: 22.4820,
    lng: 89.6050,
    colorScheme: 'blue',
    descriptionBn: 'আন্তর্জাতিক সামুদ্রিক বাণিজ্য প্রসারে নির্মিত নতুন মোংলা বন্দর রেলওয়ে স্টেশন',
    isPriority: true,
  },
  {
    id: 'MYM-LANDMARK',
    nameBn: 'ময়মনসিংহ জংশন',
    nameEn: 'Mymensingh Junction',
    category: 'junction',
    badgeLabelBn: 'ব্রহ্মপুত্র ভ্যালি রেল জংশন',
    badgeLabelEn: 'Brahmaputra Valley Junction',
    lat: 24.7578,
    lng: 90.4072,
    colorScheme: 'amber',
    descriptionBn: 'ঢাকা, জামালপুর, নেত্রকোনা ও ঝারিয়া-ঝাঞ্জাইলমুখী গুরুত্বপূর্ণ রেলওয়ে জংশন',
    isPriority: true,
  },
  {
    id: 'MOH-LANDMARK',
    nameBn: 'মোহনগঞ্জ হাওর টার্মিনাল',
    nameEn: 'Mohanganj Haor Terminal',
    category: 'terminal',
    badgeLabelBn: 'হাওর এক্সপ্রেসের শেষ গন্তব্য',
    badgeLabelEn: 'Haor Express Terminal',
    lat: 24.8680,
    lng: 90.9650,
    colorScheme: 'emerald',
    descriptionBn: 'সুনামগঞ্জ-নেত্রকোনা বিস্তীর্ণ হাওরাঞ্চলের প্রধান রেলওয়ে প্রবেশদ্বার',
    isPriority: false,
  },
  {
    id: 'CHP-LANDMARK',
    nameBn: 'চাঁদপুর রেল স্টেশন',
    nameEn: 'Chandpur Terminal',
    category: 'terminal',
    badgeLabelBn: 'মেঘনা মোহনা ইলিশ টার্মিনাল',
    badgeLabelEn: 'River Port Rail Terminal',
    lat: 23.2200,
    lng: 90.6500,
    colorScheme: 'blue',
    descriptionBn: 'পদ্মা-মেঘনা-ডাকাতিয়া মোহনার ঐতিহাসিক স্টিমার ও রেলওয়ে টার্মিনাল',
    isPriority: false,
  },
];
