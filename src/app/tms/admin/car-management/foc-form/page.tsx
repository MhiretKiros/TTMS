import FOCForm from './components/FOCForm';
import { Metadata } from 'next';

// It's good practice to add metadata to your pages.
export const metadata: Metadata = {
  title: 'FOC Form',
};

export default function FOCFormPage() {
  return <FOCForm />;
}