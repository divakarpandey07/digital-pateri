import React from 'react';
import { Info, BookOpen, Map, MapPin, DollarSign, Activity, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { translations } from '../utils/translations';

function About() {
  const { config, language } = useStore();
  const gpdp = config?.gpdpData;

  return (
    <div className="container" style={{ padding: 'var(--spacing-lg) 0', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
        <Info size={28} color="var(--primary)" />
        <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>{translations[language]?.about_title || 'About Pateri Village'}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
        
        {/* Left Column: History, GPDP and Culture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* History */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
              {language === 'hi' ? 'गाँव का इतिहास (History)' : language === 'hn' ? 'Gaon ka Itihas (History)' : 'Village History'}
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
              {language === 'hi'
                ? 'पतेरी गाँव बिहार के कैमूर (भभुआ) जिले के चाँद ब्लॉक में स्थित एक विकसित और ऐतिहासिक गाँव है। यह गाँव अपने उन्नत कृषि उत्पादन (गेहूँ, धान) और आत्मनिर्भर ग्रामीण संस्कृति के लिए जाना जाता है।'
                : language === 'hn'
                ? 'Pateri village Bihar ke Kaimur (Bhabua) jile ke Chand block me sthit ek viksit aur aitihasik gaon hai. Ye gaon apne unnat krishi utpadan (gehun, dhaan) aur aatm-nirbhar gramin sanskriti ke liye jana jata hai.'
                : 'Pateri village is a developed and historical village situated in the Chand block of Kaimur (Bhabua) district, Bihar. This village is known for its advanced agricultural production (wheat, paddy) and self-reliant rural culture.'}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              {language === 'hi'
                ? 'ग्राम पंचायत के रूप में यह शिवरामपुर ग्राम पंचायत के अंतर्गत आता है। गाँव की स्थापना के विषय में कहा जाता है कि यहाँ पर लगभग 1950 के दशक में आवश्यक परिवारों ने बसेरा शुरू किया था। धीरे-धीरे यहाँ सोलर लाइट, कंक्रीट सड़कें और उन्नत जल-सरोवर विकसित हुए।'
                : language === 'hn'
                ? 'Gram Panchayat ke roop me ye Shiwrampur Gram Panchayat ke antargat aata hai. Gaon ki sthapna ke vishay me kaha jata hai ki yahan par lagbhag 1950s me aavashyak parivaro ne basera shuru kiya tha. Dhire-dhire yahan solar lights, concrete roads, aur unnat jal-sarovar viksit hue.'
                : 'As a Gram Panchayat, it falls under Shiwrampur Gram Panchayat. Regarding the village establishment, it is said that essential families started settling here around the 1950s. Gradually, solar lights, concrete roads, and improved ponds/reservoirs were developed here.'}
            </p>
          </div>

          {/* DYNAMIC GPDP PLAN SECTION */}
          {gpdp && (
            <div className="glass-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} /> {language === 'hi' ? 'ग्राम पंचायत विकास योजना (GPDP)' : language === 'hn' ? 'Gram Panchayat Development Plan (GPDP)' : 'Gram Panchayat Development Plan (GPDP)'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                {language === 'hi'
                  ? 'पतेरी गाँव शिवरामपुर ग्राम पंचायत के अधिकार क्षेत्र में आता है। नीचे ई-ग्रामस्वराज रिपोर्ट से सत्यापित बजट आवंटन और विकास योजनाएँ दी गई हैं:'
                  : language === 'hn'
                  ? 'Pateri village Shiwrampur Gram Panchayat ke jurisdiction me aata hai. Niche eGramSwaraj report se verified budget allocation aur development schemes di gayi hain:'
                  : 'Pateri village falls under the jurisdiction of Shiwrampur Gram Panchayat. Below are verified budget allocations and development schemes from the eGramSwaraj report:'}
              </p>

              {/* Budget Overview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'hi' ? 'कुल योजना आवंटन' : language === 'hn' ? 'Total Plan Allocation' : 'Total Plan Allocation'}
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', color: 'var(--secondary)' }}>₹{gpdp.totalBudget?.toLocaleString('en-IN')}</h3>
                </div>
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {language === 'hi' ? 'किया गया कुल व्यय' : language === 'hn' ? 'Expenditure Incurred' : 'Expenditure Incurred'}
                  </span>
                  <h3 style={{ margin: '4px 0 0 0', color: 'var(--primary)' }}>₹{gpdp.totalExpenditure?.toLocaleString('en-IN')}</h3>
                </div>
              </div>

              {/* Assets Progress Counters */}
              <h4 style={{ margin: '10px 0 8px 0', fontSize: '0.9rem' }}>
                {language === 'hi' ? 'विकास संपत्तियों की प्रगति' : language === 'hn' ? 'Development Assets Progress' : 'Development Assets Progress'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px', textAlign: 'center' }}>
                <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>{gpdp.assetStatus?.completed}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'पूर्ण' : language === 'hn' ? 'Completed' : 'Completed'}</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--warning)' }}>{gpdp.assetStatus?.ongoing}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'जारी' : language === 'hn' ? 'Ongoing' : 'Ongoing'}</div>
                </div>
                <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#3b82f6' }}>{gpdp.assetStatus?.proposed}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'hi' ? 'प्रस्तावित' : language === 'hn' ? 'Proposed' : 'Proposed'}</div>
                </div>
              </div>

              {/* Sector allocations list */}
              <h4 style={{ margin: '10px 0 8px 0', fontSize: '0.9rem' }}>
                {language === 'hi' ? 'क्षेत्र-वार बजट आवंटन' : language === 'hn' ? 'Sector-Wise Budget Outlay Allocation' : 'Sector-Wise Budget Outlay Allocation'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                {gpdp.sectorAllocations?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                    <span className="text-muted">{item.sector}</span>
                    <strong style={{ color: 'var(--text-dark)' }}>₹{item.amount?.toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Culture */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
              {language === 'hi' ? 'संस्कृति और लोकगीत (Culture)' : language === 'hn' ? 'Sanskriti aur Lokgeet (Culture)' : 'Culture and Folk Songs'}
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
              {language === 'hi'
                ? 'पतेरी में सभी त्योहार जैसे छठ पूजा, होली, दुर्गा पूजा और दिवाली बहुत ही धूम-धाम से मनाए जाते हैं। गाँव में लोकगीत (भोजपुरी) और चैती परंपराएँ आज भी बुजुर्गों द्वारा जीवित रखी गई हैं।'
                : language === 'hn'
                ? 'Pateri me sabhi tyohar jaise Chhath Puja, Holi, Durga Puja, aur Diwali bahut hi dhoom-dham se manaye jate hain. Gaon me lokgeet (Bhojpuri) aur chaiti paramparayein aaj bhi buzurgon dwara jeevit rakhi gayi hain.'
                : 'All festivals like Chhath Puja, Holi, Durga Puja, and Diwali are celebrated with great pomp and show in Pateri. Folk songs (Bhojpuri) and Chaiti traditions are still kept alive by the elders in the village.'}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              {language === 'hi'
                ? 'छठ पूजा के समय कुआँ और पोखरा (मंदिर का तालाब) को बहुत ही सुंदर तरीके से सजाया जाता है जिसमें संपूर्ण गाँव शामिल होता है।'
                : language === 'hn'
                ? 'Chhath puja ke samay kuan aur pokhra (temple pond) ko pratham shreni ke anusar sajaya jata hai jisme sampoorna gaon shamil hota hai.'
                : 'During Chhath Puja, the well and pond (temple pond) are beautifully decorated, involving the entire village.'}
            </p>
          </div>

          {/* Crop Calendar */}
          <div className="glass-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>
              {language === 'hi' ? 'कृषि चक्र (Crop Calendar)' : language === 'hn' ? 'Krishi Cycle (Crop Calendar)' : 'Crop Calendar'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.85rem', marginTop: '10px' }}>
              <div style={{ background: 'var(--bg-cream)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
                <strong style={{ color: 'var(--secondary)' }}>
                  {language === 'hi' ? 'रबी फसलें (सर्दी)' : language === 'hn' ? 'Rabi Crops (Winter)' : 'Rabi Crops (Winter)'}
                </strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  {language === 'hi'
                    ? 'गेहूँ, सरसों, चना। बुवाई नवंबर में शुरू होती है; कटाई मार्च में।'
                    : language === 'hn'
                    ? 'Wheat, Mustard, Gram. Sowing starts in November; harvesting in March.'
                    : 'Wheat, Mustard, Gram. Sowing starts in November; harvesting in March.'}
                </p>
              </div>
              <div style={{ background: 'var(--bg-cream)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <strong style={{ color: 'var(--primary)' }}>
                  {language === 'hi' ? 'खरीफ फसलें (मानसून)' : language === 'hn' ? 'Kharif Crops (Monsoon)' : 'Kharif Crops (Monsoon)'}
                </strong>
                <p style={{ margin: '4px 0 0 0' }}>
                  {language === 'hi'
                    ? 'धान, मक्का, दालें। बुवाई जुलाई में शुरू होती है; कटाई नवंबर में।'
                    : language === 'hn'
                    ? 'Paddy (Rice), Maize, Lentils. Sowing starts in July; harvesting in November.'
                    : 'Paddy (Rice), Maize, Lentils. Sowing starts in July; harvesting in November.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Geography & Metadata Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-card" style={{ borderTop: '4px solid var(--secondary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '15px' }}>
              <Map size={20} color="var(--secondary)" /> {language === 'hi' ? 'भौगोलिक स्थिति' : language === 'hn' ? 'Geographical Location' : 'Geographical Location'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>{language === 'hi' ? 'गाँव का नाम' : language === 'hn' ? 'Village Name' : 'Village Name'}</span>
                <strong>Pateri</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>{language === 'hi' ? 'ग्राम पंचायत' : language === 'hn' ? 'Gram Panchayat' : 'Gram Panchayat'}</span>
                <strong style={{ color: 'var(--primary)' }}>Shiwrampur GP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>{language === 'hi' ? 'थाना' : language === 'hn' ? 'Police Thana' : 'Police Thana'}</span>
                <strong>Chand</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>{language === 'hi' ? 'जिला / जिया' : language === 'hn' ? 'District / Jila' : 'District / Jila'}</span>
                <strong>Kaimur (Bhabua)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span>{language === 'hi' ? 'राज्य' : language === 'hn' ? 'State' : 'State'}</span>
                <strong>Bihar</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{language === 'hi' ? 'पिन कोड' : language === 'hn' ? 'PIN Code' : 'PIN Code'}</span>
                <strong>821106</strong>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-cream)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              <MapPin size={16} color="var(--primary)" /> {language === 'hi' ? 'स्मार्ट गाँव निर्देशांक' : language === 'hn' ? 'Smart Village Coordinates' : 'Smart Village Coordinates'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'hi' ? 'पतेरी पंचायत केंद्र:' : language === 'hn' ? 'Pateri Panchayat Centroid:' : 'Pateri Panchayat Centroid:'} <strong>25.0210° N, 83.5684° E</strong>
            </p>
            <div style={{ background: '#e7e5e4', height: '120px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', border: '1px solid var(--border)', padding: '10px' }}>
              {language === 'hi'
                ? 'शिवरामपुर ग्राम पंचायत और चाँद ब्लॉक पर केंद्रित मानचित्र प्रतिनिधित्व।'
                : language === 'hn'
                ? 'Map representation centered on Shiwrampur Gram Panchayat & Chand Block.'
                : 'Map representation centered on Shiwrampur Gram Panchayat & Chand Block.'}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default About;
