// src/components/PaintingInfo.tsx

import React from 'react';
import { Painting } from '../types/Painting';

interface PaintingInfoProps {
  painting: Painting;
  onBack: () => void;
}

const PaintingInfo: React.FC<PaintingInfoProps> = ({ painting, onBack }) => {
  const statusColor = painting.status === "Qualified" ? "green" : "red";

  return (
    <div className="painting-info main">
      <div className='background'></div>
      <div className='content'>
        <div className='info-wrapper'>
          <div className='details-container'>
            <div className='details-wrapper'>
              <div className='details'>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <span className='info-title'>Country:</span>
                      </td>
                      <td>
                        <span>{painting.country}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className='info-title'>Artist:</span>
                      </td>
                      <td>
                        <span>{painting.artist}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className='info-title'>Title:</span>
                      </td>
                      <td>
                        <span>{painting.title}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className='info-title'>Owner:</span>
                      </td>
                      <td>
                        <span>{painting.owner}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className='info-title'>Status:</span>
                      </td>
                      <td>
                        <span style={{ color: statusColor, fontWeight: 'bold' }}>{painting.status}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className='img-wrapper'>
            <img src={painting.image} alt={painting.title} />
          </div>
        </div>
        <button onClick={onBack}><span className="text">Back</span></button>
      </div>
    </div>
  );
};

export default PaintingInfo;
