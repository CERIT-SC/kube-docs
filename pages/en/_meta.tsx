import AskGPTButton from '../../components/AskGPTButton';

export default {
  '---': {
    type: 'separator',
    title: <AskGPTButton />,
  },
  'introduction': { 
      title: (
       <>
        <strong>Introduction to Storage Services</strong>
       </>
      )
  },
  'object-storage-s3': {
     title: (
      <>
       <strong>S3 Object Storage</strong>
      </>
    )
  },
  'object-storage-rbd': {
     title: (
      <>
       <strong>RBD Object Storage</strong>
      </>
    )
  },
  'collaboration': {
     title: (
      <>
       <strong>Collaborative Tools</strong>
      </>
     )
  },
  'perun': { 
     title: (
      <>
       <strong>User Management System</strong>
      </>
     )
  },
  'faq': {
    title: (
     <>
      <strong>Frequently Asked Questions</strong>
     </>
    )
  },
};
