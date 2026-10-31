import type { Student } from '../types';
import type { SupportedLanguage } from './languageRouter';

export interface NotificationPayload {
  student: Student;
  facultyName?: string;
  interventionType?: string;
  notes?: string;
}

export interface NotificationDraft {
  subject: string;
  message: string;
  language: SupportedLanguage;
}

export function generateLocalizedNotification(
  payload: NotificationPayload,
  lang: SupportedLanguage = 'te'
): NotificationDraft {
  const { student, facultyName = 'Faculty Mentor', interventionType = 'Academic Review', notes = '' } = payload;
  const roll = student.rollNo;
  const name = student.name;
  const att = student.attendancePct;
  const mid1 = student.scores.mid1;
  const mid2 = student.scores.mid2;
  const bl = student.backlogs;
  const dept = `${student.department}-${student.section}`;

  switch (lang) {
    case 'te':
      return {
        subject: `క్లాస్‌పల్స్: ${name} (${roll}) విద్యా ప్రగతి మరియు తల్లిదండ్రుల హెచ్చరిక`,
        message: `గౌరవనీయులైన తల్లిదండ్రులారా,
క్లాస్‌పల్స్ (JNTUA NEP 2020) ద్వారా మీ వార్డు ${name} (${roll}, ${dept}) విద్యా పురోగతి గురించిన ముఖ్యమైన సమాచారం:
• ప్రస్తుత హాజరు శాతం: ${att}% ${att < 75 ? '(కనీస అవసరం 75% కన్నా తక్కువ)' : ''}
• మిడ్-1 మార్కులు: ${mid1}/30 | మిడ్-2 మార్కులు: ${mid2}/30
• బ్యాక్‌లాగ్‌లు: ${bl}
• పరిశీలన రకం: ${interventionType}
${notes ? `• అధ్యాపకుల వ్యాఖ్య: ${notes}\n` : ''}
మీ విద్యార్థి యొక్క భవిష్యత్తు మరియు విద్యా ఎదుగుదల కోసం దయచేసి మా విభాగ అధ్యాపకులను సంప్రదించండి.
భవదీయులు,
${facultyName}, విభాగ మెంటార్, క్లాస్‌పల్స్.`,
        language: 'te',
      };

    case 'ta':
      return {
        subject: `கிளாஸ்பல்ஸ்: ${name} (${roll}) கல்வி முன்னேற்ற அறிவிப்பு`,
        message: `அன்புள்ள பெற்றோரே,
கிளாஸ்பல்ஸ் (ClassPulse) மூலம் உங்கள் பிள்ளையின் ${name} (${roll}, ${dept}) கல்வி முன்னேற்றம் குறித்த தகவல்:
• தற்போதைய வருகைப்பதிவு: ${att}% ${att < 75 ? '(குறைந்தபட்சம் 75% தேவை)' : ''}
• இடைக்காலத் தேர்வு மதிப்பெண்கள்: மிட்-1: ${mid1}/30 | மிட்-2: ${mid2}/30
• நிலுவை பாடங்கள் (Backlogs): ${bl}
• நடவடிக்கை: ${interventionType}
${notes ? `• ஆசிரியரின் குறிப்பு: ${notes}\n` : ''}
உங்கள் பிள்ளையின் கல்வி நலனுக்காக எங்களை தொடர்பு கொள்ளவும்.
இப்படிக்கு,
${facultyName}, கல்வி வழிகாட்டி.`,
        language: 'ta',
      };

    case 'kn':
      return {
        subject: `ಕ್ಲಾಸ್‌ಪಲ್ಸ್: ${name} (${roll}) ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ ಸೂಚನೆ`,
        message: `ಗೌರವಾನ್ವಿತ ಪೋಷಕರೇ,
ಕ್ಲಾಸ್‌ಪಲ್ಸ್ ಮುಖಾಂತರ ನಿಮ್ಮ ವಿದ್ಯಾರ್ಥಿ ${name} (${roll}, ${dept}) ಅವರ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿಯ ಮಾಹಿತಿ:
• ಪ್ರಸ್ತುತ ಹಾಜರಾತಿ: ${att}% ${att < 75 ? '(ಕನಿಷ್ಠ 75% ಗಿಂತ ಕಡಿಮೆ)' : ''}
• ಮಧ್ಯಂತರ ಅಂಕಗಳು: ಮಿಡ್-1: ${mid1}/30 | ಮಿಡ್-2: ${mid2}/30
• ಬ್ಯಾಕ್‌ಲಾಗ್‌ಗಳು: ${bl}
• ಮಧ್ಯಸ್ಥಿಕೆ ಪ್ರಕಾರ: ${interventionType}
${notes ? `• ಶಿಕ್ಷಕರ ಟಿಪ್ಪಣಿ: ${notes}\n` : ''}
ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ದಯವಿಟ್ಟು ಕಾಲೇಜು ಮೆಂಟರ್ ಅವರನ್ನು ಸಂಪರ್ಕಿಸಿ.
ಧನ್ಯವಾದಗಳೊಂದಿಗೆ,
${facultyName}, ಮೆಂಟರ್.`,
        language: 'kn',
      };

    case 'mr':
      return {
        subject: `क्लासपल्स: ${name} (${roll}) शैक्षणिक प्रगती अहवाल`,
        message: `आदरणीय पालक,
क्लासपल्सद्वारे आपला पाल्य ${name} (${roll}, ${dept}) याच्या शैक्षणिक प्रगतीचा तपशील:
• सध्याची उपस्थिती: ${att}% ${att < 75 ? '(किमान ७५% पेक्षा कमी)' : ''}
• चाचणी गुण: मिड-१: ${mid1}/30 | मिड-२: ${mid2}/30
• अनुशेष (Backlogs): ${bl}
• हस्तक्षेप प्रकार: ${interventionType}
${notes ? `• प्राध्यापकांची नोंद: ${notes}\n` : ''}
आपल्या पाल्याच्या शैक्षणिक उज्ज्वल भविष्यासाठी कृपया संपर्क साधावा.
आपला नम्र,
${facultyName}, प्राध्यापक व मार्गदर्शक.`,
        language: 'mr',
      };

    case 'hi':
      return {
        subject: `क्लासपल्स: ${name} (${roll}) शैक्षणिक प्रगति और परामर्श सूचना`,
        message: `आदरणीय अभिभावक,
क्लासपल्स के माध्यम से आपके सुपुत्र/सुपुत्री ${name} (${roll}, ${dept}) की शैक्षणिक रिपोर्ट:
• वर्तमान उपस्थिति: ${att}% ${att < 75 ? '(आवश्यक 75% से कम)' : ''}
• आंतरिक मूल्यांकन: मिड-1: ${mid1}/30 | मिड-2: ${mid2}/30
• बैकलाग: ${bl}
• हस्तक्षेप विवरण: ${interventionType}
${notes ? `• शिक्षक की टिप्पणी: ${notes}\n` : ''}
विद्यार्थी के उज्ज्वल भविष्य और सुधार हेतु कृपया हमसे संपर्क करें।
भवदीय,
${facultyName}, संकाय संरक्षक.`,
        language: 'hi',
      };

    case 'en':
    default:
      return {
        subject: `ClassPulse: Academic Support Notice for ${name} (${roll})`,
        message: `Dear Parent / Guardian,
This is an official academic update regarding your ward ${name} (${roll}, Department: ${dept}) via ClassPulse:
• Current Attendance: ${att}% ${att < 75 ? '(Below mandatory 75% threshold)' : '(Satisfactory)'}
• Assessment Scores: Mid-1: ${mid1}/30 | Mid-2: ${mid2}/30
• Active Backlogs: ${bl}
• Scheduled Action: ${interventionType}
${notes ? `• Faculty Notes: ${notes}\n` : ''}
Please feel free to connect with the department mentor to support your ward's continuous learning.
Warm regards,
${facultyName}, Academic Mentor
ClassPulse - JNTUA NEP 2020`,
        language: 'en',
      };
  }
}
