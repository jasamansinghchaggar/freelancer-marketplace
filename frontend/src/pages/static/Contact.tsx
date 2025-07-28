import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact: React.FC = () => {
    return (
        <>
            <Navbar />
            <div className="h-[60vh] container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
                <p>If you have any questions or feedback, please reach out to us at:</p>
                <ul className="list-none list-inside">
                    <li>
                        <b>Email: </b>
                        <a className='underline' href="mailto:chaggarjasamansingh@gmail.com">
                            chaggarjasamansingh@gmail.com
                        </a>
                    </li>
                    <li><b>Phone: </b>+91 83829 37739</li>
                </ul>
            </div>
            <Footer />
        </>
    );
};

export default Contact;
