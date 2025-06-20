import { RiPhoneLine, RiMailLine, RiMapPin2Line } from 'react-icons/ri';

export const contactItems: ContactItem[] = [
  {
    icon: RiPhoneLine,
    title: 'Phone',
    lines: ['+1 (123) 456-7890', 'Mon-Fri: 8am – 6pm'],
    delay: 0,
  },
  {
    icon: RiMailLine,
    title: 'Email',
    lines: ['rentals@saanhomes.com', '24/7 Support Available'],
    delay: 0.1,
  },
  {
    icon: RiMapPin2Line,
    title: 'Location',
    lines: ['123 Construction Ave,', 'City, State 12345'],
    delay: 0.2,
  },
];