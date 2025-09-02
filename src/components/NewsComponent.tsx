import React, {useEffect, useMemo, useState} from 'react';
import {Linking, TouchableOpacity, View, Image} from 'react-native';
import styled from 'styled-components/native';
import {useLinkPreview} from '../hooks/useLinkPreview';

export default function LinkPreviewCard({
  url,
  compact = false,
  question,
}: {
  url: string[];
  compact?: boolean;
  question?: string;
}) {
  const [idx, setIdx] = useState(0);

  const urls = useMemo(
    () =>
      (url ?? []).filter(u => {
        try {
          new URL(u);
          return true;
        } catch {
          return false;
        }
      }),
    [url],
  );

  useEffect(() => {
    if (urls.length <= 1) return;
    setIdx(0);
    const t = setInterval(() => {
      setIdx(prev => (prev + 1) % urls.length);
    }, 3000);
    return () => clearInterval(t);
  }, [urls]);

  const currentUrl = urls[idx];
  const {data, loading} = useLinkPreview(currentUrl);

  const open = () => {
    if (!currentUrl) return;
    Linking.openURL(currentUrl).catch(() => {});
  };

  const domain = useMemo(() => {
    if (!currentUrl) return '';
    try {
      return new URL(currentUrl).hostname.replace(/^www\./, '');
    } catch {
      return currentUrl;
    }
  }, [currentUrl]);

  if (!urls.length) return null;

  if (loading) {
    return (
      <Wrap>
        {question ? <Question numberOfLines={2}>“{question}”</Question> : null}
        <Card as={View}>
          <Row>
            <Box w={compact ? 64 : 88} h={compact ? 64 : 88} br={8} sk />
            <Info>
              <SkLine w="70%" />
              <SkLine w="95%" mt={6} />
              <SkLine w="50%" mt={6} />
            </Info>
          </Row>
        </Card>
      </Wrap>
    );
  }

  if (!data) {
    return (
      <Wrap>
        {question ? <Question numberOfLines={2}>“{question}”</Question> : null}
        <Card as={TouchableOpacity} activeOpacity={0.85} onPress={open}>
          <Pad>
            <Title>{domain}</Title>
            <Desc>미리보기를 불러오지 못했어요. 탭하여 열기</Desc>
          </Pad>
        </Card>
      </Wrap>
    );
  }

  const hero = data.image;
  const site = data.siteName ?? domain;

  if (compact) {
    return (
      <Wrap>
        {question ? <Question numberOfLines={2}>“{question}”</Question> : null}
        <Card as={TouchableOpacity} activeOpacity={0.85} onPress={open}>
          <Row>
            {hero ? (
              <Thumb source={{uri: hero}} />
            ) : (
              <Box w={64} h={64} br={8} bg />
            )}
            <Info>
              <Title numberOfLines={1}>{data.title ?? domain}</Title>
              {data.description ? (
                <Desc numberOfLines={2}>{data.description}</Desc>
              ) : null}
              <Site small numberOfLines={1}>
                {site}
              </Site>
            </Info>
          </Row>
        </Card>
      </Wrap>
    );
  }

  return (
    <Wrap>
      {question ? <Question numberOfLines={2}>“{question}”</Question> : null}
      <Card as={TouchableOpacity} activeOpacity={0.85} onPress={open}>
        {hero ? <Hero source={{uri: hero}} /> : <Box w="100%" h={170} bg />}
        <Pad>
          <Site numberOfLines={1}>{site}</Site>
          <Title numberOfLines={2} style={{marginTop: 6}}>
            {data.title ?? domain}
          </Title>
          {data.description ? (
            <Desc numberOfLines={3} style={{marginTop: 6}}>
              {data.description}
            </Desc>
          ) : null}
        </Pad>
      </Card>
    </Wrap>
  );
}

const Wrap = styled.View`
  width: 100%;
  padding: 0 16px;
`;

const Question = styled.Text`
  font-size: 14px;
  color: #6b7280;
  margin: 8px 0 12px;
  text-align: center;
`;

const Card = styled.View`
  border: 1px solid #eceff3;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
`;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Pad = styled.View`
  padding: 12px;
`;

const Info = styled.View`
  flex: 1;
  padding: 10px 12px;
`;

const Hero = styled(Image)`
  width: 100%;
  height: 170px;
  background: #f2f4f7;
`;

const Thumb = styled(Image)`
  width: 64px;
  height: 64px;
  background: #f1f5f9;
  border-radius: 8px;
`;

const Title = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const Desc = styled.Text`
  font-size: 13px;
  color: #4b5563;
  line-height: 18px;
`;

const Site = styled.Text<{small?: boolean}>`
  font-size: ${p => (p.small ? 11 : 12)}px;
  color: #6b7280;
`;

const Box = styled.View<{
  w?: string | number;
  h?: string | number;
  br?: number;
  sk?: boolean;
  bg?: boolean;
  mt?: number;
}>`
  width: ${p =>
    p.w !== undefined ? (typeof p.w === 'number' ? `${p.w}px` : p.w) : 'auto'};
  height: ${p =>
    p.h !== undefined ? (typeof p.h === 'number' ? `${p.h}px` : p.h) : 'auto'};
  border-radius: ${p => p.br ?? 0}px;
  background: ${p => (p.sk || p.bg ? '#eef2f7' : 'transparent')};
  ${p => (p.mt ? `margin-top:${p.mt}px;` : '')}
`;

const SkLine = styled(Box).attrs({h: 12, br: 6, sk: true})``;
