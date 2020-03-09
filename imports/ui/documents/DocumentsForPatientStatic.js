import React, {Fragment} from 'react' ;
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import NoContent from '../navigation/NoContent.js';
import Paginator from '../navigation/Paginator.js';

import DocumentCard from '../documents/DocumentCard.js';

export default function DocumentsForPatientStatic ( { patientId , documents , page , perpage , ...rest } ) {

	return (
		<Fragment>
			{ documents.length === 0 &&
        		<NoContent>Nothing to see on page {page}.</NoContent>
			}
			<div {...rest}>
				{ documents.map((document, i) => (
					<DocumentCard
						key={document._id}
						document={document}
						patientChip={false}
						defaultExpanded={page === 1 && i === 0}
					/>
					))
				}
			</div>
			<Paginator page={page} end={documents.length < perpage} root={`/patient/${patientId}/documents`}/>
		</Fragment>
	) ;
}

DocumentsForPatientStatic.propTypes = {
	documents: PropTypes.array.isRequired,
	page: PropTypes.number.isRequired,
};
